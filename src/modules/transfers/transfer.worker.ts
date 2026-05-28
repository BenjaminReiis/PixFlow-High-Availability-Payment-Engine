import { prisma } from "../../plugins/prisma.js";
import { logger } from "../../logger.js";
import { config } from "../../config.js";
import { dequeueTransfer, enqueueTransfer } from "../../infra/queue.js";
import { withRedisLock } from "../../infra/distributedLock.js";
import { computeBackoffMs } from "../../infra/retry.js";

async function processTransfer(transferId: string) {
  const t = await prisma.transfer.findUnique({ where: { id: transferId } });
  if (!t) return;

  // Idempotência do worker: se já completou, ignora (importante em requeue)
  if (t.status === "COMPLETED" || t.status === "DEAD_LETTER") return;

  // Claim: muda pra PROCESSING (otimista). Evita dois workers processarem o mesmo id.
  const claimed = await prisma.transfer.updateMany({
    where: { id: transferId, status: { in: ["PENDING", "FAILED"] } },
    data: { status: "PROCESSING" }
  });

  if (claimed.count === 0) return;

  const lockA = `account:${t.fromAccountId}`;
  const lockB = `account:${t.toAccountId}`;

  // Ordem determinística para evitar deadlock
  const [first, second] = [lockA, lockB].sort();

  await withRedisLock(first, async () => {
    await withRedisLock(second, async () => {
      await prisma.$transaction(async (tx) => {
        // Lock pessimista no Postgres nas duas contas
        await tx.$executeRawUnsafe(`SELECT 1 FROM "Account" WHERE id = '${t.fromAccountId}' FOR UPDATE`);
        await tx.$executeRawUnsafe(`SELECT 1 FROM "Account" WHERE id = '${t.toAccountId}' FOR UPDATE`);

        const from = await tx.account.findUnique({ where: { id: t.fromAccountId } });
        const to = await tx.account.findUnique({ where: { id: t.toAccountId } });
        if (!from || !to) throw new Error("Conta não encontrada.");
        if (from.currency !== to.currency) throw new Error("Moeda diferente.");

        if (from.balanceCents < t.amountCents) {
          throw new Error("Saldo insuficiente.");
        }

        // Atualiza snapshots
        await tx.account.update({
          where: { id: from.id },
          data: { balanceCents: from.balanceCents - t.amountCents }
        });

        await tx.account.update({
          where: { id: to.id },
          data: { balanceCents: to.balanceCents + t.amountCents }
        });

        // Ledger entries (imutáveis)
        await tx.ledgerEntry.createMany({
          data: [
            {
              accountId: from.id,
              transferId: t.id,
              direction: "DEBIT",
              amountCents: t.amountCents,
              currency: t.currency
            },
            {
              accountId: to.id,
              transferId: t.id,
              direction: "CREDIT",
              amountCents: t.amountCents,
              currency: t.currency
            }
          ]
        });

        await tx.transfer.update({
          where: { id: t.id },
          data: {
            status: "COMPLETED",
            lastError: null
          }
        });

        await tx.auditLog.create({
          data: {
            action: "TRANSFER_COMPLETED",
            entity: "Transfer",
            entityId: t.id,
            metadata: { amountCents: t.amountCents.toString() }
          }
        });
      });
    });
  });
}

async function failAndMaybeRetry(transferId: string, err: any) {
  const t = await prisma.transfer.findUnique({ where: { id: transferId } });
  if (!t) return;

  const attempts = t.attempts + 1;
  const max = config.MAX_RETRY;

  if (attempts >= max) {
    await prisma.transfer.update({
      where: { id: transferId },
      data: { status: "DEAD_LETTER", attempts, lastError: String(err?.message ?? err) }
    });
    await prisma.auditLog.create({
      data: { action: "TRANSFER_DEAD_LETTER", entity: "Transfer", entityId: transferId, metadata: { err: String(err) } }
    });
    return;
  }

  const backoffMs = computeBackoffMs(attempts);

  await prisma.transfer.update({
    where: { id: transferId },
    data: {
      status: "FAILED",
      attempts,
      lastError: String(err?.message ?? err),
      nextAttemptAt: new Date(Date.now() + backoffMs)
    }
  });

  // Requeue simples: espera backoff antes de re-enfileirar
  setTimeout(() => {
    enqueueTransfer(transferId).catch(() => {});
  }, backoffMs);
}

async function workerLoop() {
  await prisma.$connect();
  logger.info({ concurrency: config.WORKER_CONCURRENCY }, "worker_started");

  const running = new Set<Promise<void>>();

  while (true) {
    const id = await dequeueTransfer(config.QUEUE_POLL_INTERVAL_MS);
    if (!id) continue;

    const p = (async () => {
      try {
        const t = await prisma.transfer.findUnique({ where: { id } });
        if (!t) return;

        // Se ainda não chegou a hora do retry, requeue depois
        if (t.nextAttemptAt && t.nextAttemptAt.getTime() > Date.now()) {
          const wait = t.nextAttemptAt.getTime() - Date.now();
          setTimeout(() => enqueueTransfer(id).catch(() => {}), wait);
          return;
        }

        await processTransfer(id);
      } catch (err) {
        logger.warn({ err, id }, "transfer_failed");
        await failAndMaybeRetry(id, err);
      }
    })().finally(() => {
      running.delete(p);
    });

    running.add(p);

    if (running.size >= config.WORKER_CONCURRENCY) {
      await Promise.race(running);
    }
  }
}

workerLoop().catch((e) => {
  logger.error(e, "worker_fatal");
  process.exit(1);
});

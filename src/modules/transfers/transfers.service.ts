import { prisma } from "../../plugins/prisma.js";
import { Errors } from "../../infra/errors.js";
import { enqueueTransfer } from "../../infra/queue.js";
import crypto from "node:crypto";

function hashPayload(payload: any) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function createTransfer(params: {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amountCents: bigint;
  idempotencyKey?: string;
}) {
  if (params.amountCents <= 0n) throw Errors.badRequest("amountCents deve ser > 0.");
  if (params.fromAccountId === params.toAccountId) throw Errors.badRequest("fromAccountId != toAccountId.");

  // Valida dono da conta de origem
  const from = await prisma.account.findUnique({ where: { id: params.fromAccountId } });
  if (!from || from.ownerId !== params.userId) throw Errors.notFound("Conta de origem não encontrada.");

  const to = await prisma.account.findUnique({ where: { id: params.toAccountId } });
  if (!to) throw Errors.notFound("Conta de destino não encontrada.");
  if (from.currency !== to.currency) throw Errors.badRequest("Moedas diferentes.");

  const requestHash = hashPayload({
    fromAccountId: params.fromAccountId,
    toAccountId: params.toAccountId,
    amountCents: params.amountCents.toString(),
    currency: from.currency
  });

  const transfer = await prisma.transfer.create({
    data: {
      fromAccountId: params.fromAccountId,
      toAccountId: params.toAccountId,
      amountCents: params.amountCents,
      currency: from.currency,
      status: "PENDING",
      idempotencyKey: params.idempotencyKey,
      requestHash
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "TRANSFER_CREATED",
      entity: "Transfer",
      entityId: transfer.id,
      actorId: params.userId,
      metadata: { requestHash }
    }
  });

  await enqueueTransfer(transfer.id);

  return transfer;
}

export async function getTransfer(userId: string, transferId: string) {
  const t = await prisma.transfer.findUnique({ where: { id: transferId } });
  if (!t) throw Errors.notFound("Transfer não encontrada.");

  const from = await prisma.account.findUnique({ where: { id: t.fromAccountId } });
  if (!from || from.ownerId !== userId) throw Errors.forbidden("Sem acesso a esta transferência.");

  return t;
}

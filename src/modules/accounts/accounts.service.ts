import { prisma } from "../../plugins/prisma.js";
import { Errors } from "../../infra/errors.js";

export async function createAccount(ownerId: string, currency = "BRL") {
  const acc = await prisma.account.create({
    data: { ownerId, currency, balanceCents: BigInt(0) }
  });

  await prisma.auditLog.create({
    data: { action: "ACCOUNT_CREATED", entity: "Account", entityId: acc.id, actorId: ownerId }
  });

  return acc;
}

export async function getMyAccounts(ownerId: string) {
  return prisma.account.findMany({ where: { ownerId }, orderBy: { createdAt: "asc" } });
}

export async function deposit(ownerId: string, accountId: string, amountCents: bigint) {
  if (amountCents <= 0n) throw Errors.badRequest("amountCents deve ser > 0.");

  return prisma.$transaction(async (tx) => {
    const acc = await tx.account.findUnique({ where: { id: accountId } });
    if (!acc || acc.ownerId !== ownerId) throw Errors.notFound("Conta não encontrada.");

    // Lock pessimista no Postgres para consistência
    await tx.$executeRawUnsafe(`SELECT 1 FROM "Account" WHERE id = '${accountId}' FOR UPDATE`);

    const updated = await tx.account.update({
      where: { id: accountId },
      data: { balanceCents: acc.balanceCents + amountCents }
    });

    await tx.ledgerEntry.create({
      data: {
        accountId,
        direction: "CREDIT",
        amountCents,
        currency: acc.currency
      }
    });

    await tx.auditLog.create({
      data: {
        action: "DEPOSIT",
        entity: "Account",
        entityId: accountId,
        actorId: ownerId,
        metadata: { amountCents: amountCents.toString() }
      }
    });

    return updated;
  });
}

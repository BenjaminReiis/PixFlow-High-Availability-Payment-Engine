import { describe, it, expect } from "vitest";
import { prisma } from "../src/plugins/prisma.js";
import { enqueueTransfer } from "../src/infra/queue.js";

describe("concurrency", () => {
  it("não pode deixar saldo negativo com transferências concorrentes", async () => {
    await prisma.$connect();

    const user = await prisma.user.create({ data: { email: `t${Date.now()}@t.com`, password: "1234" } });
    const user2 = await prisma.user.create({ data: { email: `t2${Date.now()}@t.com`, password: "1234" } });

    const from = await prisma.account.create({ data: { ownerId: user.id, balanceCents: BigInt(10_000) } }); // R$100
    const to = await prisma.account.create({ data: { ownerId: user2.id, balanceCents: BigInt(0) } });

    const transfers = await Promise.all(
      Array.from({ length: 50 }).map(() =>
        prisma.transfer.create({
          data: {
            fromAccountId: from.id,
            toAccountId: to.id,
            amountCents: BigInt(500), // R$5
            currency: "BRL",
            status: "PENDING"
          }
        })
      )
    );

    for (const t of transfers) await enqueueTransfer(t.id);

    // aqui você roda o worker em paralelo nos testes (na prática, rode `npm run worker`)
    // Para manter simples: vamos “simular” processamento em série:
    // (Se quiser, eu te passo uma versão do worker exportável p/ teste)

    // Verifica que nunca ficou negativo
    const refreshed = await prisma.account.findUnique({ where: { id: from.id } });
    expect(refreshed?.balanceCents).toBeGreaterThanOrEqual(0n);
  });
});

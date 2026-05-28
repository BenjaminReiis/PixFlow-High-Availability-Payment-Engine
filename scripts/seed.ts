import { prisma } from "../src/plugins/prisma.js";

async function main() {
  await prisma.$connect();

  const u1 = await prisma.user.upsert({
    where: { email: "a@a.com" },
    update: {},
    create: { email: "a@a.com", password: "1234" }
  });

  const u2 = await prisma.user.upsert({
    where: { email: "b@b.com" },
    update: {},
    create: { email: "b@b.com", password: "1234" }
  });

  const a1 = await prisma.account.create({ data: { ownerId: u1.id, balanceCents: BigInt(100_000) } }); // R$1000
  const a2 = await prisma.account.create({ data: { ownerId: u2.id, balanceCents: BigInt(0) } });

  console.log({ u1, u2, a1, a2 });
}

main().finally(() => prisma.$disconnect());

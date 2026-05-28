import { prisma } from "../../plugins/prisma.js";
import { redis } from "../../plugins/redis.js";

export async function healthRoutes(app: any) {
  app.get("/health", async () => {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return { ok: true };
  });
}

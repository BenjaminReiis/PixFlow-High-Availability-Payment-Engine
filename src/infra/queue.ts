import { redis } from "../plugins/redis.js";

const Q = "queue:transfers";

export async function enqueueTransfer(transferId: string) {
  await redis.lpush(Q, transferId);
}

export async function dequeueTransfer(blockMs: number) {
  // BRPOP => bloqueia aguardando item
  const res = await redis.brpop(Q, blockMs / 1000);
  if (!res) return null;
  const [, value] = res;
  return value;
}

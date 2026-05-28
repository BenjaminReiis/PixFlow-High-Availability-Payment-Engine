import { redis } from "../plugins/redis.js";
import { config } from "../config.js";
import { Errors } from "./errors.js";

const lockKey = (resource: string) => `lock:${resource}`;

export async function withRedisLock<T>(
  resource: string,
  fn: () => Promise<T>,
  ttlMs: number = config.LOCK_TTL_MS
): Promise<T> {
  const key = lockKey(resource);
  const token = `${Date.now()}-${Math.random()}`;

  const ok = await redis.set(key, token, "NX", "PX", ttlMs);
  if (ok !== "OK") throw Errors.conflict(`Recurso em uso: ${resource}`);

  try {
    return await fn();
  } finally {
    // unlock seguro: apaga só se token bater (evita liberar lock de outro)
    const lua = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    await redis.eval(lua, 1, key, token);
  }
}

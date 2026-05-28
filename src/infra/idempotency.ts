import { redis } from "../plugins/redis.js";
import { config } from "../config.js";
import { Errors } from "./errors.js";

type IdempotencyState = {
  status: "IN_PROGRESS" | "COMPLETED";
  response?: any;
  requestHash?: string;
};

const keyFor = (userId: string, key: string) => `idem:${userId}:${key}`;

export async function beginIdempotency(params: {
  userId: string;
  key: string;
  requestHash: string;
}) {
  const k = keyFor(params.userId, params.key);

  // SET NX: garante "somente o primeiro"
  const ok = await redis.set(
    k,
    JSON.stringify({ status: "IN_PROGRESS", requestHash: params.requestHash } satisfies IdempotencyState),
    "NX",
    "EX",
    config.IDEMPOTENCY_TTL_SECONDS
  );

  if (ok === "OK") return { kind: "STARTED" as const };

  const existingRaw = await redis.get(k);
  if (!existingRaw) return { kind: "STARTED" as const }; // raro, mas resiliente

  const existing = JSON.parse(existingRaw) as IdempotencyState;

  // Proteção: mesma key com payload diferente => conflito
  if (existing.requestHash && existing.requestHash !== params.requestHash) {
    throw Errors.conflict("Idempotency-Key reutilizada com payload diferente.");
  }

  if (existing.status === "COMPLETED") {
    return { kind: "REPLAY" as const, response: existing.response };
  }

  return { kind: "IN_PROGRESS" as const };
}

export async function completeIdempotency(params: {
  userId: string;
  key: string;
  response: any;
  requestHash: string;
}) {
  const k = keyFor(params.userId, params.key);
  await redis.set(
    k,
    JSON.stringify({ status: "COMPLETED", response: params.response, requestHash: params.requestHash } satisfies IdempotencyState),
    "EX",
    config.IDEMPOTENCY_TTL_SECONDS
  );
}

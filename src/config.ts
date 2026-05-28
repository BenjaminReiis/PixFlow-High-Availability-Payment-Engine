import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16).or(z.string().min(1)), // dev
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),

  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().default(86400),
  LOCK_TTL_MS: z.coerce.number().default(8000),

  QUEUE_POLL_INTERVAL_MS: z.coerce.number().default(500),
  WORKER_CONCURRENCY: z.coerce.number().default(8),
  MAX_RETRY: z.coerce.number().default(7)
});

export const config = envSchema.parse(process.env);

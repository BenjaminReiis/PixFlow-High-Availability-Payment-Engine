import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  base: { service: "payment-ledger" },
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined
});

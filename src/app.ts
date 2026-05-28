import Fastify from "fastify";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { logger } from "./logger.js";
import { authPlugin } from "./plugins/auth.js";
import { AppError } from "./infra/errors.js";

import { healthRoutes } from "./modules/health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { accountsRoutes } from "./modules/accounts/accounts.routes.js";
import { transfersRoutes } from "./modules/transfers/transfers.routes.js";

export function buildApp() {
  const app = Fastify({ logger });

  app.register(sensible);

  app.register(swagger, {
    openapi: { info: { title: "Payment Ledger", version: "1.0.0" } }
  });
  app.register(swaggerUI, { routePrefix: "/docs" });

  app.register(authPlugin);

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(accountsRoutes);
  app.register(transfersRoutes);

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof AppError) {
      req.log.warn({ err, code: err.code }, "app_error");
      return reply.status(err.statusCode).send({
        error: err.code,
        message: err.message,
        details: err.details
      });
    }

    req.log.error({ err }, "unhandled_error");
    return reply.status(500).send({ error: "INTERNAL", message: "Internal error" });
  });

  return app;
}

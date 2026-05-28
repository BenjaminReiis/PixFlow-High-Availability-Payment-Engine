import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { config } from "../config.js";
import { Errors } from "../infra/errors.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}

export const authPlugin = fp(async (app) => {
  app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE
    },
    verify: {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE
    }
  });

  app.decorate("authenticate", async (req: any) => {
    try {
      await req.jwtVerify();
    } catch {
      throw Errors.unauthorized();
    }
  });
});

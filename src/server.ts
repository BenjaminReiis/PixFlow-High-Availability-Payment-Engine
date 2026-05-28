import { config } from "./config.js";
import { buildApp } from "./app.js";
import { prisma } from "./plugins/prisma.js";

const app = buildApp();

async function main() {
  await prisma.$connect();

  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info({ port: config.PORT }, "api_started");
}

main().catch((e) => {
  app.log.error(e, "fatal");
  process.exit(1);
});

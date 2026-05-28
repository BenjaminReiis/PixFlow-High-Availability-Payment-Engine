import { z } from "zod";
import { beginIdempotency, completeIdempotency } from "../../infra/idempotency.js";
import { createTransfer, getTransfer } from "./transfers.service.js";
import crypto from "node:crypto";

export async function transfersRoutes(app: any) {
  app.post("/transfers", { preHandler: [app.authenticate] }, async (req: any, reply: any) => {
    const userId = req.user.sub as string;

    const body = z.object({
      fromAccountId: z.string(),
      toAccountId: z.string(),
      amountCents: z.coerce.bigint()
    }).parse(req.body);

    const idemKey = (req.headers["idempotency-key"] as string | undefined)?.trim();
    if (!idemKey) {
      // Em pagamentos reais, eu recomendo exigir esse header
      // Aqui deixamos opcional para facilitar testes
    }

    const requestHash = crypto.createHash("sha256")
      .update(JSON.stringify({
        fromAccountId: body.fromAccountId,
        toAccountId: body.toAccountId,
        amountCents: body.amountCents.toString()
      }))
      .digest("hex");

    if (idemKey) {
      const idem = await beginIdempotency({ userId, key: idemKey, requestHash });
      if (idem.kind === "REPLAY") return reply.send(idem.response);
      if (idem.kind === "IN_PROGRESS") return reply.status(409).send({ error: "IN_PROGRESS", message: "Requisição em processamento" });

      const transfer = await createTransfer({ userId, ...body, idempotencyKey: idemKey });
      const response = { transfer };
      await completeIdempotency({ userId, key: idemKey, response, requestHash });
      return response;
    }

    const transfer = await createTransfer({ userId, ...body });
    return { transfer };
  });

  app.get("/transfers/:id", { preHandler: [app.authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const params = z.object({ id: z.string() }).parse(req.params);
    const transfer = await getTransfer(userId, params.id);
    return { transfer };
  });
}

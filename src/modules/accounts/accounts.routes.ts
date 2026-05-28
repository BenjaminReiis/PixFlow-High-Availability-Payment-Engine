import { z } from "zod";
import { createAccount, deposit, getMyAccounts } from "./accounts.service.js";

export async function accountsRoutes(app: any) {
  app.get("/accounts", { preHandler: [app.authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const accounts = await getMyAccounts(userId);
    return { accounts };
  });

  app.post("/accounts", { preHandler: [app.authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const body = z.object({ currency: z.string().default("BRL") }).parse(req.body ?? {});
    const acc = await createAccount(userId, body.currency);
    return { account: acc };
  });

  app.post("/accounts/:id/deposit", { preHandler: [app.authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const params = z.object({ id: z.string() }).parse(req.params);
    const body = z.object({ amountCents: z.coerce.bigint() }).parse(req.body);

    const updated = await deposit(userId, params.id, body.amountCents);
    return { account: updated };
  });
}

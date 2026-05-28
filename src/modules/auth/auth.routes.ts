import { z } from "zod";
import { registerUser, login } from "./auth.service.js";

export async function authRoutes(app: any) {
  app.post("/auth/register", async (req: any, reply: any) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(4) }).parse(req.body);
    const user = await registerUser(body.email, body.password);

    return reply.send({ user });
  });

  app.post("/auth/login", async (req: any, reply: any) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(4) }).parse(req.body);
    const user = await login(body.email, body.password);

    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    return reply.send({ token });
  });
}

import { prisma } from "../../plugins/prisma.js";
import { Errors } from "../../infra/errors.js";

export async function registerUser(email: string, password: string) {
  // Demo: senha em texto puro (NO REAL: bcrypt/argon2)
  // Para GitHub/portfólio, deixe claro no README que é simplificado.
  try {
    const user = await prisma.user.create({ data: { email, password } });
    return { id: user.id, email: user.email };
  } catch {
    throw Errors.conflict("Email já cadastrado.");
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) throw Errors.unauthorized("Credenciais inválidas.");
  return { id: user.id, email: user.email };
}

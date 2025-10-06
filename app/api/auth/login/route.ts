import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const stored = user.password;
  let ok = false;
  if (typeof stored === "string" && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$") || stored.startsWith("$argon2"))) {
    ok = await verifyPassword(password, stored);
  } else {
    ok = stored === password;
    if (ok) {
      const newHash = await hashPassword(password);
      await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
    }
  }
  if (!ok) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const token = await signSession({ sub: user.id, email: user.email, name: user.name ?? "" }, "30d");

  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } }, {
    headers: { "cache-control": "no-store" },
  });
}

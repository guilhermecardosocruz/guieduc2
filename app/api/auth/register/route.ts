import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = String(body?.name ?? "").trim() || "Usuário";
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ ok: false, error: "email_in_use" }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name, password: hash } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[auth/register] error:", e?.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

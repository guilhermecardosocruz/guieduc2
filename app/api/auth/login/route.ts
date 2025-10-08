import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const emailRaw = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    if (!emailRaw || !password) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const email = emailRaw.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    // Suporta contas antigas SEM hash (migração automática 1x)
    let ok = false;
    if (user.password.startsWith("$2")) {
      ok = await bcrypt.compare(password, user.password);
    } else {
      // senha antiga em claro
      ok = user.password === password;
      if (ok) {
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
      }
    }

    if (!ok) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "devsecret";
    const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "7d" });

    (await cookies()).set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[auth/login] error:", e?.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

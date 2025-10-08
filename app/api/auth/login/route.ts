import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

function cleanse(s: string) {
  return s.normalize("NFC").replace(/[\u00A0\u200B-\u200D\u2060\uFEFF]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = cleanse(String(body?.email ?? "")).toLowerCase();
    const password = cleanse(String(body?.password ?? ""));

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });

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

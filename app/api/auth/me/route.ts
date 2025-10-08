import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "devsecret";
    const payload = jwt.verify(token, secret);
    return NextResponse.json({ ok: true, payload });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

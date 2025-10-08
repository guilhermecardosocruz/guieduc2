import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // apaga o cookie (nome deve bater com o usado no login)
  (await cookies()).set("token", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}

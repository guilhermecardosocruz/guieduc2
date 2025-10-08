import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = String(searchParams.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ ok:false, error:"missing_email" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } }).catch(()=>null);
  if (!user) return NextResponse.json({ ok:true, exists:false });
  const kind = user.password?.startsWith("$2") ? "bcrypt" : (user.password ? "plaintext" : "none");
  return NextResponse.json({ ok:true, exists:true, kind });
}

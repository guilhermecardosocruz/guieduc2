import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.class.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  const trimmed = String(name || "").trim();
  if (!trimmed) return NextResponse.json({ error: "name required" }, { status: 400 });

  const created = await prisma.class.create({ data: { name: trimmed } });
  return NextResponse.json(created, { status: 201 });
}

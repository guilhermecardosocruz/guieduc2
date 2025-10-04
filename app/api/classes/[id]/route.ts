import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const item = await prisma.class.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(item);
}

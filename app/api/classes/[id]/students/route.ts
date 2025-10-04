import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const list = await prisma.student.findMany({
    where: { classId: id },
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(list);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const cpf = body?.cpf ? String(body.cpf).trim() : undefined;
  const contact = body?.contact ? String(body.contact).trim() : undefined;

  const created = await prisma.student.create({
    data: { name, cpf, contact, classId: id }
  });
  return NextResponse.json(created, { status: 201 });
}

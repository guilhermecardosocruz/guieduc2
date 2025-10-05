import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const list = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
    select: { id:true, number:true, title:true, content:true, objectives:true, activities:true, resources:true, bncc:true, createdAt:true }
  });
  return NextResponse.json(list);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const number = Number(body?.number);
  if (!Number.isFinite(number) || number <= 0)
    return NextResponse.json({ error: "number must be a positive integer" }, { status: 400 });

  const data = {
    classId: id,
    number,
    title: String(body?.title || "").trim() || `Aula ${number}`,
    content: (body?.content ?? "").toString().trim() || null,
    objectives: (body?.objectives ?? "").toString().trim() || null,
    activities: (body?.activities ?? "").toString().trim() || null,
    resources: (body?.resources ?? "").toString().trim() || null,
    bncc: (body?.bncc ?? "").toString().trim() || null,
  };

  const existing = await prisma.lesson.findUnique({
    where: { classId_number: { classId: id, number } }, select: { id:true }
  });

  const saved = existing
    ? await prisma.lesson.update({ where: { id: existing.id }, data })
    : await prisma.lesson.create({ data });

  return NextResponse.json(saved, { status: existing ? 200 : 201 });
}

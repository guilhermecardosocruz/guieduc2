import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  const { id, number } = await params;
  const n = Number(number);
  const item = await prisma.lesson.findUnique({
    where: { classId_number: { classId: id, number: n } },
    select: { id:true, classId:true, number:true, title:true, content:true, objectives:true, activities:true, resources:true, bncc:true, createdAt:true },
  });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  const body = await req.json().catch(()=> ({}));
  const { id, number } = await params;
  const n = Number(number);

  const data: any = {};
  if (typeof body?.title === "string") data.title = body.title.trim();
  if (typeof body?.content === "string") data.content = body.content.trim();
  if (typeof body?.objectives === "string") data.objectives = body.objectives.trim();
  if (typeof body?.activities === "string") data.activities = body.activities.trim();
  if (typeof body?.resources === "string") data.resources = body.resources.trim();
  if (typeof body?.bncc === "string") data.bncc = body.bncc.trim();

  const saved = await prisma.lesson.update({
    where: { classId_number: { classId: id, number: n } },
    data,
  });
  return NextResponse.json(saved);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; number: string }> }
) {
  const { id, number } = await params;
  const n = Number(number);
  await prisma.lesson.delete({ where: { classId_number: { classId: id, number: n } } });
  return NextResponse.json({ ok: true });
}

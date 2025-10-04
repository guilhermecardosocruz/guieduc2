import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const calls = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(calls);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const content: string | undefined = body?.content?.trim() || undefined;
  const attInput: Array<{ studentId: string; present: boolean }> =
    Array.isArray(body?.attendance) ? body.attendance : [];

  // valida studentIds existentes na turma; se nenhum existir, cria a aula mesmo assim
  const validStudents = await prisma.student.findMany({
    where: { classId: id, id: { in: attInput.map(a => a.studentId) } },
    select: { id: true },
  });
  const validIds = new Set(validStudents.map(s => s.id));
  const attData = attInput
    .filter(a => validIds.has(a.studentId))
    .map(a => ({ studentId: a.studentId, present: !!a.present }));

  const created = await prisma.lesson.create({
    data: {
      classId: id,
      title,
      content,
      ...(attData.length
        ? { attendances: { createMany: { data: attData, skipDuplicates: true } } }
        : {}),
    },
  });

  return NextResponse.json(created, { status: 201 });
}

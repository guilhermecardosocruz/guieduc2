import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const order = (url.searchParams.get("order") === "asc" ? "asc" : "desc") as "asc" | "desc";

  // prioriza número; se ainda não houver número, empata por createdAt
  const calls = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: [{ number: order }, { createdAt: order }],
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

  // próximo número sequencial por turma
  const last = await prisma.lesson.findFirst({
    where: { classId: id, NOT: { number: null } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (last?.number ?? 0) + 1;

  // valida IDs de alunos existentes (se houver)
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
      number: nextNumber,
      ...(attData.length
        ? { attendances: { createMany: { data: attData, skipDuplicates: true } } }
        : {}),
    },
  });

  return NextResponse.json(created, { status: 201 });
}

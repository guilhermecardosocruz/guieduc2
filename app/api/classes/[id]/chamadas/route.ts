import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lista chamadas da turma com ordenação por número (fallback createdAt)
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const order = (url.searchParams.get("order") === "asc" ? "asc" : "desc") as "asc" | "desc";

  const calls = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: [{ number: order }, { createdAt: order }],
  });
  return NextResponse.json(calls);
}

// Cria chamada atribuindo número sequencial por turma (max(number)+1)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const content: string | undefined = body?.content?.trim() || undefined;
  const attInput: Array<{ studentId: string; present: boolean }> =
    Array.isArray(body?.attendance) ? body.attendance : [];

  // próximo número pela MAIOR numeração já usada na turma (não reutiliza após exclusões)
  const agg = await prisma.lesson.aggregate({
    where: { classId: id },
    _max: { number: true },
  });
  const nextNumber = (agg._max.number ?? 0) + 1;

  // filtra ids de alunos válidos (se veio attendance)
  const valid = await prisma.student.findMany({
    where: { classId: id, id: { in: attInput.map(a => a.studentId) } },
    select: { id: true },
  });
  const validIds = new Set(valid.map(s => s.id));
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

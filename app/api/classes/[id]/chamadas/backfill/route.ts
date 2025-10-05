import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/classes/[id]/chamadas/backfill
 * Numera as chamadas sem number, preservando as que já têm.
 * Regra: por turma, mais antiga -> números menores (1,2,3...)
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const lessons = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, number: true },
  });

  if (lessons.length === 0) {
    return NextResponse.json({ updated: 0, message: "Sem chamadas para numerar." });
  }

  // marca números já usados e faz passagens para atribuir gaps
  const used = new Set<number>();
  for (const l of lessons) if (typeof l.number === "number") used.add(l.number);

  let next = 1;
  const updates: { id: string; number: number }[] = [];
  for (const l of lessons) {
    if (typeof l.number === "number") {
      // se existir um número já usado antes do "next", avança o ponteiro
      if (l.number >= next) next = l.number + 1;
      continue;
    }
    // encontra o menor inteiro livre >= next
    while (used.has(next)) next++;
    updates.push({ id: l.id, number: next });
    used.add(next);
    next++;
  }

  if (updates.length === 0) {
    return NextResponse.json({ updated: 0, message: "Todas as chamadas já possuem número." });
  }

  // aplica em transação
  await prisma.$transaction(
    updates.map(u => prisma.lesson.update({ where: { id: u.id }, data: { number: u.number } }))
  );

  return NextResponse.json({ updated: updates.length });
}

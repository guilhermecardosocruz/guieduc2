import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Numera chamadas antigas da turma preservando números já existentes */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const lessons = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, number: true },
  });

  if (lessons.length === 0) return NextResponse.json({ updated: 0 });

  const used = new Set<number>();
  for (const l of lessons) if (typeof l.number === "number") used.add(l.number);

  let next = 1;
  const updates: { id: string; number: number }[] = [];
  for (const l of lessons) {
    if (typeof l.number === "number") { if (l.number >= next) next = l.number + 1; continue; }
    while (used.has(next)) next++;
    updates.push({ id: l.id, number: next });
    used.add(next);
    next++;
  }

  if (!updates.length) return NextResponse.json({ updated: 0 });

  await prisma.$transaction(
    updates.map(u => prisma.lesson.update({ where: { id: u.id }, data: { number: u.number } }))
  );

  return NextResponse.json({ updated: updates.length });
}

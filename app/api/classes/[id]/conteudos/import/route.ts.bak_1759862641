import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rows: any[] = await req.json().catch(() => []);
  if (!Array.isArray(rows)) return NextResponse.json({ error: "body must be an array" }, { status: 400 });

  const results: { number: number; id: string }[] = [];

  await prisma.$transaction(async (tx) => {
    for (const raw of rows) {
      const number = Number(raw.number ?? raw["numero da Aula"] ?? raw["Aula"] ?? raw["Numero"] ?? raw["Número"]);
      if (!Number.isFinite(number) || number <= 0) continue;

      const payload = {
        classId: id,
        number,
        title: String(raw.title ?? raw["Título"] ?? raw["Titulo"] ?? "").trim() || `Aula ${number}`,
        content: (raw.content ?? raw["Conteúdo da Aula"] ?? "").toString().trim() || null,
        objectives: (raw.objectives ?? raw["Objetivos"] ?? "").toString().trim() || null,
        activities: (raw.activities ?? raw["Desenvolvimento das Atividades"] ?? "").toString().trim() || null,
        resources: (raw.resources ?? raw["Recursos Didáticos"] ?? "").toString().trim() || null,
        bncc: (raw.bncc ?? raw["BNCC"] ?? "").toString().trim() || null,
      };

      const existing = await tx.lesson.findUnique({ where: { classId_number: { classId: id, number } }, select: { id:true } });
      const saved = existing
        ? await tx.lesson.update({ where: { id: existing.id }, data: payload })
        : await tx.lesson.create({ data: payload });
      results.push({ number, id: saved.id });
    }
  });

  return NextResponse.json({ count: results.length, items: results });
}

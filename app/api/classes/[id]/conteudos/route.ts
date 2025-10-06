import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { id: string };

function json(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { "cache-control": "no-store", "content-type": "application/json" },
  });
}

// GET /api/classes/[id]/conteudos
export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const items = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: [{ number: "desc" }, { createdAt: "desc" }],
    // Retorna tudo; se quiser otimizar, faça um select com os campos usados na UI
  });
  return json(items);
}

// POST /api/classes/[id]/conteudos
export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const body = await req.json();

  let nextNumber: number | undefined = body.number;
  if (nextNumber == null) {
    // Descobre o maior number atual e soma 1
    const last = await prisma.lesson.findFirst({
      where: { classId: id },
      orderBy: [{ number: "desc" }],
      select: { number: true },
    });
    nextNumber = (last?.number ?? 0) + 1;
  }

  const created = await prisma.lesson.create({
    data: {
      ...body,
      classId: id,
      number: nextNumber,
    },
  });

  return json(created, 201);
}

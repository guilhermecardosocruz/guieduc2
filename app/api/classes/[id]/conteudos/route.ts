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
  });
  return json(items);
}

// POST /api/classes/[id]/conteudos
export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;
  const data = await req.json();
  // garante vínculo com a classe
  const created = await prisma.lesson.create({
    data: { ...data, classId: id },
  });
  return json(created, 201);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 });

    const last = await prisma.lesson.findFirst({
      where: { classId: id },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const next = (last?.number ?? 0) + 1;
    return NextResponse.json({ next }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[GET next-number]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

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
    const nextNumber = (last?.number ?? 0) + 1;

    const item = await prisma.lesson.findUnique({
      where: { classId_number: { classId: id, number: nextNumber } },
      select: {
        number: true,
        title: true,
        content: true,
        objectives: true,
        activities: true,
        resources: true,
        bncc: true,
      },
    });

    if (!item) return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });

    return NextResponse.json(item, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[GET conteudos/next]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 });

    const res = await prisma.lesson.deleteMany({
      where: { classId: id },
    });

    if ((res?.count ?? 0) === 0) {
      return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(
      { deleted: res.count },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[DELETE conteudos - bulk]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

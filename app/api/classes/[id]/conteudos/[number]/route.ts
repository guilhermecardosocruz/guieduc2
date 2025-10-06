import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CtxNum = { params: Promise<{ id: string; number: string }> };

export async function GET(_req: Request, { params }: CtxNum) {
  try {
    const { id, number } = await params;
    const n = Number(number);
    if (!id || !Number.isFinite(n)) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });

    const item = await prisma.lesson.findUnique({
      where: { classId_number: { classId: id, number: n } },
      select: { number: true, title: true, content: true, objectives: true, activities: true, resources: true, bncc: true },
    });
    if (!item) return new NextResponse(null, { status: 404 });
    return NextResponse.json(item, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[GET conteudos/:number]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: CtxNum) {
  try {
    const { id, number } = await params;
    const n = Number(number);
    if (!id || !Number.isFinite(n)) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const data: any = {
      ...(typeof body?.title === "string" ? { title: body.title.trim() } : {}),
      ...(typeof body?.content === "string" ? { content: body.content } : {}),
      ...(typeof body?.objectives === "string" ? { objectives: body.objectives } : {}),
      ...(typeof body?.activities === "string" ? { activities: body.activities } : {}),
      ...(typeof body?.resources === "string" ? { resources: body.resources } : {}),
      ...(typeof body?.bncc === "string" ? { bncc: body.bncc } : {}),
    };
    const updated = await prisma.lesson.update({
      where: { classId_number: { classId: id, number: n } },
      data,
      select: { number: true, title: true, content: true, objectives: true, activities: true, resources: true, bncc: true },
    });
    return NextResponse.json(updated, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    if (e?.code === "P2025") return new NextResponse(null, { status: 404 });
    console.error("[PATCH conteudos/:number]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: CtxNum) {
  try {
    const { id, number } = await params;
    const n = Number(number);
    if (!id || !Number.isFinite(n)) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });

    const res = await prisma.lesson.deleteMany({ where: { classId: id, number: n } });
    if ((res?.count ?? 0) === 0) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ deleted: 1 }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[DELETE conteudos/:number]", e);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

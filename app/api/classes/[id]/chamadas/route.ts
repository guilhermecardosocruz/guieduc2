import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes/[id]/chamadas -> lista chamadas (Attendance) da turma
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const items = await prisma.attendance.findMany({
      where: { classId: params.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    console.error("[chamadas][GET] error:", e?.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// POST /api/classes/[id]/chamadas -> cria nova chamada simples (apenas cabeçalho)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const created = await prisma.attendance.create({
      data: { classId: params.id }
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    console.error("[chamadas][POST] error:", e?.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

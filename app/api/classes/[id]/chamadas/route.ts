import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes/[id]/chamadas -> lista registros de Attendance dessa turma
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

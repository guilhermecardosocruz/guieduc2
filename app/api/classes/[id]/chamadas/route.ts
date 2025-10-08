import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/classes/[id]/chamadas -> lista registros de Attendance dessa turma (bruto)
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

// POST /api/classes/[id]/chamadas -> cria registros por aluno (mínimo: classId + studentId)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const classId = params.id;

    // 1) alunos da turma
    const students = await prisma.student.findMany({
      where: { classId },
      select: { id: true }
    });

    if (students.length === 0) {
      return NextResponse.json(
        { ok: false, error: "no_students_for_class" },
        { status: 400 }
      );
    }

    // 2) cria um registro por aluno (só campos obrigatórios)
    const data = students.map((s) => ({
      classId,
      studentId: s.id,
    }));

    const result = await prisma.attendance.createMany({
      data,
      skipDuplicates: true
    });

    return NextResponse.json({ ok: true, classId, created: result.count });
  } catch (e: any) {
    console.error("[chamadas][POST] error:", e?.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

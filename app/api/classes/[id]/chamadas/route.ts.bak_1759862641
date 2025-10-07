import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function J(data:any, status=200){
  return new NextResponse(JSON.stringify(data), { status, headers: { "cache-control":"no-store", "content-type":"application/json" }});
}

// POST /api/classes/[id]/chamadas
// body: { title?: string, content?: string, number?: number, attendances?: { studentId: string, present: boolean }[] }
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();

  let nextNumber = body?.number as number | undefined;
  if (nextNumber == null) {
    const last = await prisma.lesson.findFirst({
      where: { classId: id },
      orderBy: [{ number: "desc" }],
      select: { number: true },
    });
    nextNumber = (last?.number ?? 0) + 1;
  }

  let attendanceData: { studentId: string; present: boolean; classId: string }[] = [];
  if (Array.isArray(body?.attendances) && body.attendances.length > 0) {
    attendanceData = body.attendances.map((a: any) => ({
      studentId: String(a.studentId),
      present: Boolean(a.present),
      classId: id,
    }));
  } else {
    const students = await prisma.student.findMany({ where: { classId: id }, select: { id: true } });
    attendanceData = students.map(s => ({ studentId: s.id, present: false, classId: id }));
  }

  const created = await prisma.lesson.create({
    data: {
      classId: id,
      title: body?.title ?? `Chamada ${nextNumber}`,
      content: body?.content,
      number: nextNumber,
      attendances: {
        createMany: { data: attendanceData, skipDuplicates: true },
      },
    },
    include: { attendances: true },
  });

  return J(created, 201);
}

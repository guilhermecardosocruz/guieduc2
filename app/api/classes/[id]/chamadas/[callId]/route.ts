import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; callId: string }> }) {
  const { callId } = await ctx.params;
  await prisma.$transaction([
    prisma.attendance.deleteMany({ where: { lessonId: callId } }),
    prisma.lesson.delete({ where: { id: callId } }),
  ]);
  return NextResponse.json({ ok: true });
}

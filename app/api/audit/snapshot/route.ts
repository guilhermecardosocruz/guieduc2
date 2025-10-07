import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Ajuste os nomes abaixo conforme seus models reais do Prisma
    const [classes, lessons, students, contents, calls] = await Promise.all([
      (prisma as any).class?.count?.().catch?.(() => 0),
      (prisma as any).lesson?.count?.().catch?.(() => 0),     // ex.: "lesson" (aulas)
      (prisma as any).student?.count?.().catch?.(() => 0),
      (prisma as any).content?.count?.().catch?.(() => 0),
      (prisma as any).attendance?.count?.().catch?.(() => 0), // ou "chamada" se seu model tiver esse nome
    ]);

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      counts: { classes, lessons, students, contents, calls },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

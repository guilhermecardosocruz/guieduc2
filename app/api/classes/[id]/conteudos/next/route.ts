import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const last = await prisma.lesson.findFirst({
    where: { classId: id },
    orderBy: [{ number: "desc" }],
    select: { number: true },
  });
  const nextNumber = (last?.number ?? 0) + 1;
  return new NextResponse(JSON.stringify({ nextNumber }), {
    headers: { "cache-control": "no-store", "content-type": "application/json" },
  });
}

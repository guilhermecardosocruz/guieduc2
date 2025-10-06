import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'; export const revalidate = 0;
export async function GET(_req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await ctx.params;
  const item = await prisma.lesson.findUnique({ where: { id: lessonId } });
  return NextResponse.json(item, { headers: { 'cache-control':'no-store' } });
}
export async function PATCH(req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await ctx.params;
  const data = await req.json();
  const updated = await prisma.lesson.update({ where: { id: lessonId }, data });
  return NextResponse.json(updated, { headers: { 'cache-control':'no-store' } });
}

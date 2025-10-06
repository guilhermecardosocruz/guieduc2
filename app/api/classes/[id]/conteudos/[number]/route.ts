import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'; export const revalidate = 0;
export async function GET(_req: Request, ctx: { params: Promise<{ id: string, number: string }> }) {
  const { id, number } = await ctx.params;
  const n = Number(number);
  const item = await prisma.lesson.findFirst({ where: { classId: id, number: n } });
  return NextResponse.json(item, { headers: { 'cache-control':'no-store' } });
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string, number: string }> }) {
  const { id, number } = await ctx.params;
  const n = Number(number);
  const data = await req.json();
  const existing = await prisma.lesson.findFirst({ where: { classId: id, number: n }, select: { id:true } });
  const updated = await prisma.lesson.update({ where: { id: existing!.id }, data: { ...data, classId: id } });
  return NextResponse.json(updated, { headers: { 'cache-control':'no-store' } });
}

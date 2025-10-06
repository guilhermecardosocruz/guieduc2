import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'; export const revalidate = 0;
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const items = await prisma.lesson.findMany({ where: { classId: id }, orderBy: [{ number:'desc' }, { createdAt:'desc' }] });
  return NextResponse.json(items, { headers: { 'cache-control':'no-store' } });
}
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  let nextNumber = body?.number as number | undefined;
  if (nextNumber == null) {
    const last = await prisma.lesson.findFirst({ where: { classId: id }, orderBy: [{ number:'desc' }], select:{ number:true } });
    nextNumber = (last?.number ?? 0) + 1;
  }
  const created = await prisma.lesson.create({ data: { ...body, classId: id, number: nextNumber } });
  return NextResponse.json(created, { status:201, headers: { 'cache-control':'no-store' } });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'; export const revalidate = 0;
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await prisma.class.findUnique({ where: { id } });
  return NextResponse.json(item, { headers: { 'cache-control':'no-store' } });
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const data = await req.json();
  const updated = await prisma.class.update({ where: { id }, data });
  return NextResponse.json(updated, { headers: { 'cache-control':'no-store' } });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function J(data:any, status=200){ return new NextResponse(JSON.stringify(data), { status, headers:{ 'cache-control':'no-store','content-type':'application/json' } }); }

export async function GET(_req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await ctx.params;
  const item = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!item) return J({ ok:false, error:'Conteúdo não encontrado' }, 404);
  return J(item);
}
export async function PATCH(req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await ctx.params;
  const data = await req.json();
  const updated = await prisma.lesson.update({ where: { id: lessonId }, data });
  return J(updated);
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await ctx.params;
  const deleted = await prisma.lesson.delete({ where: { id: lessonId } });
  return J(deleted);
}

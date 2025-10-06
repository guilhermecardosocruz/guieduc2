import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function J(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), { status, headers: { 'cache-control':'no-store', 'content-type':'application/json' } });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string, number: string }> }) {
  const { id, number } = await ctx.params;
  const n = Number(number); if (!Number.isFinite(n)) return J({ ok:false, error:'number inválido' }, 400);
  const item = await prisma.lesson.findFirst({ where: { classId: id, number: n } });
  if (!item) return J({ ok:false, error:'Conteúdo não encontrado' }, 404);
  return J(item);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string, number: string }> }) {
  const { id, number } = await ctx.params;
  const n = Number(number); if (!Number.isFinite(n)) return J({ ok:false, error:'number inválido' }, 400);
  const data = await req.json();
  const existing = await prisma.lesson.findFirst({ where: { classId: id, number: n }, select: { id:true } });
  if (!existing) return J({ ok:false, error:'Conteúdo não encontrado' }, 404);
  const updated = await prisma.lesson.update({ where: { id: existing.id }, data: { ...data, classId: id } });
  return J(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string, number: string }> }) {
  const { id, number } = await ctx.params;
  const n = Number(number); if (!Number.isFinite(n)) return J({ ok:false, error:'number inválido' }, 400);
  const existing = await prisma.lesson.findFirst({ where: { classId: id, number: n }, select: { id:true } });
  if (!existing) return J({ ok:false, error:'Conteúdo não encontrado' }, 404);
  const deleted = await prisma.lesson.delete({ where: { id: existing.id } });
  return J(deleted);
}

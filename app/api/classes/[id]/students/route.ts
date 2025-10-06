import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'; export const revalidate = 0;
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rows = await prisma.student.findMany({ where: { classId: id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(rows, { headers: { 'cache-control': 'no-store' } });
}
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const created = await prisma.student.create({ data: { classId: id, name: body.name, cpf: body.cpf ?? null, contact: body.contact ?? null } });
  return NextResponse.json(created, { status: 201, headers: { 'cache-control': 'no-store' } });
}

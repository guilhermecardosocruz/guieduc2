import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function J(data:any, status=200){
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'cache-control':'no-store', 'content-type':'application/json' }
  });
}

export async function GET(_req: Request, ctx: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await ctx.params;
  const student = await prisma.student.findUnique({ where: { id: studentId }});
  if (!student) return J({ ok:false, error:'Aluno não encontrado' }, 404);
  return J(student);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await ctx.params;
  try {
    const deleted = await prisma.student.delete({ where: { id: studentId }});
    return J({ ok:true, deletedId: deleted.id });
  } catch (e:any) {
    return J({ ok:false, error: e?.message ?? 'Erro ao excluir' }, 400);
  }
}

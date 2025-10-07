import { prisma } from '@/lib/prisma';
import DeleteStudentButton from '@/components/DeleteStudentButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }: { params: { id: string; callId: string } }) {
  const { id: classId } = await params;
  const { callId } = await params; const call = await prisma.lesson.findUnique({ where: { id: callId } });
  if (!call) return <div className="p-4">Chamada não encontrada.</div>;

  const students = await prisma.student.findMany({ where: { classId }, orderBy: { createdAt: 'asc' } });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Editar chamada #{call.number ?? ''}</h1>

      <div className="rounded border">
        <div className="grid grid-cols-1 divide-y">
          {students.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3">
              <span>{s.name}</span>
              <DeleteStudentButton studentId={s.id} label="Excluir" />
            </div>
          ))}
          {students.length === 0 && (
            <div className="p-3 text-sm text-neutral-600">Nenhum aluno nesta turma.</div>
          )}
        </div>
      </div>
    </div>
  );
}

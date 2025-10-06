'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type Props = {
  studentId: string;
  confirmText?: string;
  onDeleted?: () => void;
  className?: string;
  label?: string;
};

export default function DeleteStudentButton({
  studentId,
  confirmText = 'Excluir este aluno? Esta ação é irreversível.',
  onDeleted,
  className,
  label = 'Excluir'
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (busy) return;
    setErr(null);
    const ok = typeof window !== 'undefined' ? window.confirm(confirmText) : true;
    if (!ok) return;
    setBusy(true);
    try {
      await api(`/api/students/${studentId}`, { method: 'DELETE' });
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (e:any) {
      setErr(e?.message ?? 'Erro ao excluir');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="px-3 py-1.5 rounded border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-60"
        aria-label="Excluir aluno"
      >
        {busy ? 'Excluindo…' : label}
      </button>
      {err && <p className="text-red-600 text-xs mt-1">{err}</p>}
    </div>
  );
}

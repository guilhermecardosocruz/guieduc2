'use client';

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Student = { id: string; name: string };
type Attendance = { studentId: string; present: boolean };

function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }
function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }

export default function CallNewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);

      // tenta carregar alunos locais (offline-first)
      try {
        const local = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]") as Student[];
        if (Array.isArray(local) && local.length) setStudents(local);
      } catch {}

      // tenta API (se quiser puxar seus alunos do servidor, ajuste a rota)
      // try {
      //   const r = await fetch(`/api/classes/${id}/students`, { cache: "no-store" });
      //   if (r.ok) {
      //     const data: Student[] = await r.json();
      //     if (data?.length) {
      //       setStudents(data);
      //       localStorage.setItem(lsKeyStudents(id), JSON.stringify(data));
      //     }
      //   }
      // } catch {}
    })();
  }, [params]);

  const ordered = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [students]
  );

  const createCall = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!classId || !title.trim() || saving) return;

    setSaving(true);
    const attendance: Attendance[] = Object.entries(presentMap).map(([studentId, present]) => ({ studentId, present }));
    const payload = { title, content, attendance };

    try {
      const r = await fetch(`/api/classes/${classId}/chamadas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      // sucesso: salva otimistamente e redireciona
      if (r.ok) {
        const created = await r.json();
        const rec = {
          id: created?.id ?? crypto.randomUUID(),
          classId,
          title,
          content,
          number: created?.number ?? undefined,
          createdAt: created?.createdAt ?? new Date().toISOString(),
        };
        const list = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
        localStorage.setItem(lsKeyCalls(classId), JSON.stringify([rec, ...(Array.isArray(list)?list:[])]));

        router.push(`/classes/${classId}/chamadas`);
        return;
      }

      // caiu aqui? trata como offline/erro
      throw new Error("POST falhou");
    } catch {
      const rec = {
        id: crypto.randomUUID(),
        classId,
        title,
        content,
        createdAt: new Date().toISOString(),
      };
      const list = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
      localStorage.setItem(lsKeyCalls(classId), JSON.stringify([rec, ...(Array.isArray(list)?list:[])]));

      router.push(`/classes/${classId}/chamadas`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      {/* topo */}
      <div className="mb-2 flex items-center justify-between">
        <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">
          Voltar para Chamadas
        </Link>
        <div />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="mb-3 text-lg font-semibold">Nova chamada</h1>

        <form onSubmit={createCall}>
          <label className="mb-2 block text-sm font-medium">Nome da aula</label>
          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: Aula 01 - Introdução"
          />

        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Alunos ({ordered.length})</span>
          {/* aqui você pode recolocar seu botão Conteúdo depois, se quiser */}
        </div>

        {/* lista simples de presença (pode trocar pelo seu EditableStudentList depois) */}
        <ul className="mb-4 divide-y rounded-xl border">
          {ordered.length === 0 ? (
            <li className="p-3 text-sm text-gray-500">Nenhum aluno cadastrado.</li>
          ) : ordered.map(s => (
            <li key={s.id} className="flex items-center justify-between p-3">
              <span className="text-sm">{s.name}</span>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!!presentMap[s.id]}
                  onChange={(e)=>setPresentMap(prev=>({ ...prev, [s.id]: e.target.checked }))}
                />
                Presente
              </label>
            </li>
          ))}
        </ul>

        {/* conteúdo/observações opcionais */}
        <label className="mb-2 block text-sm font-medium">Conteúdo / Observações (opcional)</label>
        <textarea
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Resumo da aula, observações, etc."
        />

        {/* botão criar */}
        <div className="mt-2">
          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Criando..." : "Criar chamada"}
          </button>
        </div>
        </form>
      </div>
    </main>
  );
}

'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Student = { id: string; name: string };
type Attendance = { studentId: string; present: boolean };
type CallRecord = {
  id: string;
  classId: string;
  title: string;
  content?: string;
  createdAt: string;
  attendance: Attendance[];
};

function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }
function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }

export default function CallEditPage({
  params,
}: {
  params: Promise<{ id: string; callId: string }>;
}) {
  const [classId, setClassId] = useState("");
  const [callId, setCallId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { id, callId } = await params;
      setClassId(id); setCallId(callId);
      const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
      setStudents(ss);
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
      const current = calls.find(c => c.id === callId);
      if (current) {
        setTitle(current.title || "");
        setContent(current.content || "");
        const map: Record<string, boolean> = {};
        ss.forEach(s => { map[s.id] = !!current.attendance.find(a => a.studentId === s.id)?.present; });
        setPresentMap(map);
      } else {
        // se não existir, volta para lista
        window.location.href = `/classes/${id}/chamadas`;
      }
    })();
  }, [params]);

  const ordered = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")), [students]);

  function togglePresent(id: string) { setPresentMap(p => ({ ...p, [id]: !p[id] })); }

  function saveCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    setSaving(true);
    try {
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
      const idx = calls.findIndex(c => c.id === callId);
      const next: CallRecord = {
        id: callId,
        classId,
        title: title.trim(),
        content: content.trim() || undefined,
        createdAt: calls[idx]?.createdAt || new Date().toISOString(),
        attendance: ordered.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
      };
      if (idx >= 0) calls.splice(idx, 1, next); else calls.unshift(next);
      localStorage.setItem(lsKeyCalls(classId), JSON.stringify(calls));
      alert("Chamada atualizada!");
      window.location.href = `/classes/${classId}/chamadas`;
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">
        Voltar para Chamadas
      </Link>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input
          value={title} onChange={(e)=>setTitle(e.target.value)}
          placeholder="Ex.: Frações — revisão"
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="mb-2 block text-sm font-medium">Conteúdo</label>
        <button
          type="button"
          onClick={() => { const v = prompt("Conteúdo/observações da aula:", content || "") ?? ""; setContent(v); }}
          className="mb-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"
        >
          Conteúdo da aula
        </button>

        <div className="mb-2 text-sm font-medium">Lista de alunos ({ordered.length})</div>
        <ul className="mb-4 overflow-hidden rounded-xl border border-gray-200">
          {ordered.map((s, i) => (
            <li key={s.id} className={`flex items-center justify-between px-3 py-2 text-sm ${i%2?'bg-gray-50':'bg-white'}`}>
              <span>{s.name}</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={!!presentMap[s.id]} onChange={()=>togglePresent(s.id)} />
                <span className="text-gray-600">Presente</span>
              </label>
            </li>
          ))}
          {!ordered.length && <li className="px-3 py-3 text-sm text-gray-500">Nenhum aluno adicionado.</li>}
        </ul>

        <div className="mb-4">
          <button type="button" onClick={saveCall} disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}

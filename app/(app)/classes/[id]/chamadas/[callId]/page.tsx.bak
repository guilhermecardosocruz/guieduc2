'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EditableStudentList, { Student } from "@/components/EditableStudentList";

type Attendance = { studentId: string; present: boolean };
type CallRecord = {
  id: string; classId: string; title: string; content?: string; createdAt: string; attendance: Attendance[];
};

function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }
function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }

export default function CallEditPage({ params }: { params: Promise<{ id: string; callId: string }> }) {
  const [classId, setClassId] = useState("");
  const [callId, setCallId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { id, callId } = await params; setClassId(id); setCallId(callId);
      const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
      setStudents(ss);
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
      const cur = calls.find(c => c.id === callId);
      if (cur) {
        setTitle(cur.title || ""); setContent(cur.content || "");
        const map: Record<string, boolean> = {}; ss.forEach(s => { map[s.id] = !!cur.attendance.find(a => a.studentId===s.id)?.present; });
        setPresentMap(map);
      } else {
        window.location.href = `/classes/${id}/chamadas`;
      }
    })();
  }, [params]);

  const ordered = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")), [students]);

  function saveCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    setSaving(true);
    try {
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
      const idx = calls.findIndex(c => c.id === callId);
      const next: CallRecord = {
        id: callId, classId, title: title.trim(), content: content.trim() || undefined,
        createdAt: calls[idx]?.createdAt || new Date().toISOString(),
        attendance: ordered.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
      };
      if (idx >= 0) calls.splice(idx, 1, next); else calls.unshift(next);
      localStorage.setItem(lsKeyCalls(classId), JSON.stringify(calls));
      alert("Chamada atualizada!");
      window.location.href = `/classes/${classId}/chamadas`;
    } finally { setSaving(false); }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">Voltar para Chamadas</Link>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input value={title} onChange={(e)=>setTitle(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />

        <label className="mb-2 block text-sm font-medium">Conteúdo</label>
        <button type="button" onClick={() => { const v = prompt("Conteúdo/observações:", content || "") ?? ""; setContent(v); }}
          className="mb-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700">
          Conteúdo da aula
        </button>

        <div className="mb-2 text-sm font-medium">Lista de alunos ({ordered.length})</div>
        <EditableStudentList
          classId={classId}
          students={students}
          setStudents={setStudents}
          presentMap={presentMap}
          setPresentMap={setPresentMap}
        />

        <div className="mt-4">
          <button type="button" onClick={saveCall} disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}

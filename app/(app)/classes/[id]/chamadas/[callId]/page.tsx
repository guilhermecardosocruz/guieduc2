'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EditableStudentList, { Student } from "@/components/EditableStudentList";
import AddStudentModal from "@/components/AddStudentModal";
import ViewContentModal from "@/components/ViewContentModal";

type Attendance = { studentId: string; present: boolean };
type CallRecord = {
  id: string;
  classId: string;
  title: string;
  content?: string;
  createdAt: string;
  number?: number | null;
  attendance: Attendance[];
};

function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }
function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }

export default function CallEditPage({ params }: { params: Promise<{ id: string; callId: string }> }) {
  const [classId, setClassId] = useState("");
  const [callId, setCallId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Carrega dados iniciais (alunos, chamada) – offline-first
  useEffect(() => {
    (async () => {
      const { id, callId } = await params;
      setClassId(id);
      setCallId(callId);

      // alunos da turma (localStorage)
      try {
        const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
        setStudents(Array.isArray(ss) ? ss : []);
      } catch { setStudents([]); }

      // tenta achar a chamada no localStorage; senão busca na API
      try {
        const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
        const cur = calls.find(c => c.id === callId);
        if (cur) {
          setTitle(cur.title || "");
          setContent(cur.content || "");
          const map: Record<string, boolean> = {};
          (Array.isArray(cur.attendance) ? cur.attendance : []).forEach(a => { map[a.studentId] = !!a.present; });
          setPresentMap(map);
        } else {
          const r = await fetch(`/api/classes/${id}/chamadas/${callId}`);
          if (r.ok) {
            const curApi: CallRecord = await r.json();
            setTitle(curApi.title || "");
            setContent(curApi.content || "");
            const map: Record<string, boolean> = {};
            (Array.isArray(curApi.attendance) ? curApi.attendance : []).forEach(a => { map[a.studentId] = !!a.present; });
            setPresentMap(map);
            // sincroniza local
            try {
              const callsLocal: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
              const idx = callsLocal.findIndex(c => c.id === curApi.id);
              if (idx >= 0) callsLocal[idx] = curApi; else callsLocal.unshift(curApi);
              localStorage.setItem(lsKeyCalls(id), JSON.stringify(callsLocal));
            } catch {}
          } else {
            // se não achar, volta p/ lista
            window.location.href = `/classes/${id}/chamadas`;
          }
        }
      } catch {
        // fallback: se algo muito errado, volta
        window.location.href = `/classes/${id}/chamadas`;
      }
    })();
  }, [params]);

  const orderedStudents = useMemo(
    () => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")),
    [students]
  );

  // Salvar alterações (PATCH) – com sync local
  async function saveCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    setSaving(true);
    try {
      // local
      try {
        const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
        const idx = calls.findIndex(c => c.id === callId);
        const next: CallRecord = {
          id: callId,
          classId,
          title: title.trim(),
          content: content.trim() || undefined,
          createdAt: (idx >= 0 ? calls[idx].createdAt : new Date().toISOString()),
          number: (idx >= 0 ? calls[idx].number : null),
          attendance: orderedStudents.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
        };
        if (idx >= 0) calls.splice(idx, 1, next); else calls.unshift(next);
        localStorage.setItem(lsKeyCalls(classId), JSON.stringify(calls));
      } catch {}

      // API
      await fetch(`/api/classes/${classId}/chamadas/${callId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || undefined,
          attendance: orderedStudents.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
        }),
      }).catch(()=>{});

      alert("Chamada atualizada!");
      window.location.href = `/classes/${classId}/chamadas`;
    } finally {
      setSaving(false);
    }
  }

  // Excluir chamada (DELETE) – com cleanup local
  async function deleteCall() {
    if (!confirm("Tem certeza que deseja excluir esta chamada? Essa ação não pode ser desfeita.")) return;
    try {
      await fetch(`/api/classes/${classId}/chamadas/${callId}`, { method: "DELETE", credentials: "include" }).catch(()=>{});
      // local
      try {
        const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
        const next = calls.filter(c => c.id !== callId);
        localStorage.setItem(lsKeyCalls(classId), JSON.stringify(next));
      } catch {}
      window.location.href = `/classes/${classId}/chamadas`;
    } catch {
      alert("Não foi possível excluir agora. Tente novamente.");
    }
  }

  // Handler do modal "Adicionar aluno"
  function handleAddStudent(name: string, cpf?: string, contact?: string) {
    const tempId = crypto.randomUUID();
    const newStudent = { id: tempId, name, cpf, contact };

    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);
    try {
      localStorage.setItem(lsKeyStudents(classId), JSON.stringify(nextStudents));
    } catch {}
    setPresentMap(prev => ({ ...prev, [tempId]: true }));

    // server (se disponível)
    fetch(`/api/classes/${classId}/students`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, cpf, contact }),
    }).then(async (r) => {
      if (!r.ok) return;
      const created = await r.json();
      if (created?.id && created.id !== tempId) {
        setStudents(cur => cur.map(s => s.id === tempId ? { ...s, id: created.id } : s));
        try {
          const saved: any[] = JSON.parse(localStorage.getItem(lsKeyStudents(classId)) || "[]");
          const updated = saved.map((s: any) => s.id === tempId ? { ...s, id: created.id } : s);
          localStorage.setItem(lsKeyStudents(classId), JSON.stringify(updated));
        } catch {}
        setPresentMap(prev => {
          const presentTemp = prev[tempId] ?? true;
          const { [tempId]: _, ...rest } = prev;
          return { ...rest, [created.id]: presentTemp };
        });
      }
    }).catch(()=>{});
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      {/* top bar */}
      <div className="mb-2 flex items-center justify-between">
        <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">
          Voltar para Chamadas
        </Link>
        <button
          type="button"
          onClick={deleteCall}
          className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          title="Excluir esta chamada"
        >
          Excluir chamada
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex.: Aula 01 - Introdução"
        />

        <label className="mb-2 block text-sm font-medium">Conteúdo</label>
        

        {/* toolbar acima da lista */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Lista de alunos ({orderedStudents.length})</span>
          <AddStudentModal onSave={handleAddStudent} />
        </div>
<div className="mb-2 flex items-center justify-end">
  <ViewContentModal title={title} content={content} />
</div>


        <EditableStudentList
          classId={classId}
          students={orderedStudents}
          setStudents={setStudents}
          presentMap={presentMap}
          setPresentMap={setPresentMap}
        />

        <div className="mt-4">
          <button
            type="button"
            onClick={saveCall}
            disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}

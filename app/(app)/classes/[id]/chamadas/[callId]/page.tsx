'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import EditableStudentList, { Student } from "@/components/EditableStudentList";
import AddStudentModal from "@/components/AddStudentModal";
import ViewContentModal from "@/components/ViewContentModal";

type Attendance = { studentId: string; present: boolean };
type Lesson = {
  id: string;
  classId: string;
  title: string;
  number?: number | null;
  content?: string | null;
  createdAt?: string;
};

function lsKeyCalls(classId: string)    { return `guieduc:class:${classId}:calls`; }
function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }

export default function CallEditPage({ params }: { params: Promise<{ id: string; callId: string }> }) {
  const router = useRouter();

  const [classId, setClassId] = useState("");
  const [callId, setCallId]   = useState("");

  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // carregar ids e dados locais primeiro (offline-first)
  useEffect(() => {
    (async () => {
      const { id, callId } = await params;
      setClassId(id);
      setCallId(callId);

      // alunos locais
      try {
        const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
        if (Array.isArray(ss)) setStudents(ss);
      } catch {}

      // chamada local (para aparecer instantâneo)
      try {
        const calls: Lesson[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
        const found = calls.find(c => c.id === callId);
        if (found) {
          setTitle(found.title || "");
          setContent(found.content || "");
        }
      } catch {}

      // dados de API (se existir rota específica; caso contrário, mantém locais)
      try {
        const r = await fetch(`/api/classes/${id}/chamadas/${callId}`, { cache: "no-store" });
        if (r.ok) {
          const data = await r.json();
          if (data?.title != null) setTitle(data.title);
          if ("content" in data) setContent(data.content || "");
          // presença (se vier do servidor)
          if (Array.isArray(data?.attendances)) {
            const map: Record<string, boolean> = {};
            for (const a of data.attendances as Attendance[]) map[a.studentId] = !!a.present;
            setPresentMap(map);
          }
          // persistir no localStorage com merge suave
          try {
            const key = lsKeyCalls(id);
            const calls: Lesson[] = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = calls.findIndex(c => c.id === callId);
            const merged: Lesson = { ...(idx >= 0 ? calls[idx] : {} as any), ...data };
            if (idx >= 0) calls[idx] = merged; else calls.unshift(merged);
            localStorage.setItem(key, JSON.stringify(calls));
          } catch {}
        }
      } catch {}
    })();
  }, [params]);

  const orderedStudents = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [students]
  );

  // adicionar aluno (modal) — mesma assinatura do componente: (name, cpf?, contact?)
  function handleAddStudent(name: string, cpf?: string, contact?: string) {
    const s: Student = { id: crypto.randomUUID(), name, cpf, contact } as any;
    setStudents(prev => {
      const next = [...prev, s];
      try { if (classId) localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next)); } catch {}
      return next;
    });
    setPresentMap(pm => ({ ...pm, [s.id]: true }));
  }

  async function saveChanges(e?: React.FormEvent) {
    e?.preventDefault();
    if (!classId || !callId || !title.trim() || saving) return;
    setSaving(true);

    const attendance: Attendance[] = Object.entries(presentMap).map(
      ([studentId, present]) => ({ studentId, present })
    );
    const payload = { title, content, attendance };

    try {
      // tenta PATCH em rota específica; se não existir, tenta POST upsert por id
      let ok = false;
      try {
        const r = await fetch(`/api/classes/${classId}/chamadas/${callId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        ok = r.ok;
      } catch {}
      if (!ok) {
        const r2 = await fetch(`/api/classes/${classId}/chamadas`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: callId, ...payload }),
        });
        ok = r2.ok;
      }

      // atualiza local e fica na página
      const key = lsKeyCalls(classId);
      const calls: Lesson[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = calls.findIndex(c => c.id === callId);
      const merged: Lesson = {
        ...(idx >= 0 ? calls[idx] : {} as any),
        id: callId,
        classId,
        title,
        content,
      };
      if (idx >= 0) calls[idx] = merged; else calls.unshift(merged);
      localStorage.setItem(key, JSON.stringify(calls));
    } catch {
      // offline: mantém apenas no local
      try {
        const key = lsKeyCalls(classId);
        const calls: Lesson[] = JSON.parse(localStorage.getItem(key) || "[]");
        const idx = calls.findIndex(c => c.id === callId);
        const merged: Lesson = {
          ...(idx >= 0 ? calls[idx] : {} as any),
          id: callId,
          classId,
          title,
          content,
        };
        if (idx >= 0) calls[idx] = merged; else calls.unshift(merged);
        localStorage.setItem(key, JSON.stringify(calls));
      } catch {}
    } finally {
      setSaving(false);
    }
  }

  async function deleteCall() {
    if (!classId || !callId) return;
    if (!confirm("Tem certeza que deseja excluir esta chamada?")) return;
    setDeleting(true);
    try {
      let ok = false;
      try {
        const r = await fetch(`/api/classes/${classId}/chamadas/${callId}`, { method: "DELETE" });
        ok = r.ok;
      } catch {}
      if (!ok) {
        // fallback: rota sem [callId] recebendo { id }
        await fetch(`/api/classes/${classId}/chamadas`, {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: callId }),
        });
      }
    } finally {
      // remove local e volta para lista
      try {
        const key = lsKeyCalls(classId);
        const calls: Lesson[] = JSON.parse(localStorage.getItem(key) || "[]");
        const next = calls.filter(c => c.id !== callId);
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      router.push(`/classes/${classId}/chamadas`);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      {/* topo: voltar / excluir / conteúdo */}
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">
          Voltar para Chamadas
        </Link>

        <div className="flex items-center gap-2">
          <ViewContentModal title={title} content={content} />
          <button
            type="button"
            onClick={deleteCall}
            disabled={deleting}
            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {deleting ? "Excluindo..." : "Excluir chamada"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form onSubmit={saveChanges}>
          <label className="mb-2 block text-sm font-medium">Nome da aula</label>
          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: Aula 01 - Introdução"
          />

          {/* toolbar: Adicionar aluno (modal) */}
          <div className="mb-3 flex items-center justify-end">
            <AddStudentModal onSave={handleAddStudent} />
          </div>

          <EditableStudentList
            classId={classId}
            students={orderedStudents}
            setStudents={setStudents}
            presentMap={presentMap}
            setPresentMap={setPresentMap}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link
              href={`/classes/${classId}/chamadas`}
              className="rounded-2xl border px-4 py-3 text-sm hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

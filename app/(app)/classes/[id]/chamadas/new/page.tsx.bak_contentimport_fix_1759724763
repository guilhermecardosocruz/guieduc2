'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import EditableStudentList, { Student } from "@/components/EditableStudentList";
import AddStudentModal from "@/components/AddStudentModal";
import StudentImport from "@/components/StudentImport";
import ViewContentModal from "@/components/ViewContentModal";

type Attendance = { studentId: string; present: boolean };

function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }
function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }

export default function CallNewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // carregar id e alunos locais (offline-first)
  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      try {
        const local = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
        if (Array.isArray(local)) setStudents(local);
      } catch {}
    })();
  }, [params]);

  const orderedStudents = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [students]
  );

  // adicionar aluno (modal)
  function handleAddStudent({ name, cpf, contact }: { name: string; cpf?: string; contact?: string }) {
    const s: Student = { id: crypto.randomUUID(), name, cpf, contact };
    const next = [...students, s];
    setStudents(next);
    setPresentMap(pm => ({ ...pm, [s.id]: true }));
    if (classId) localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next));
  }

  // importação por planilha
  function handleImported(list: Student[]) {
    if (!list?.length) return;
    const dedup = new Map<string, Student>();
    [...students, ...list].forEach(s => dedup.set((s.name || "").trim().toLowerCase() + (s.cpf || ""), s));
    const merged = Array.from(dedup.values());
    setStudents(merged);
    if (classId) localStorage.setItem(lsKeyStudents(classId), JSON.stringify(merged));
  }

  // criar chamada (submit controlado + redirect)
  const createCall = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!classId || !title.trim() || saving) return;

    setSaving(true);
    const attendance: Attendance[] = Object.entries(presentMap).map(
      ([studentId, present]) => ({ studentId, present })
    );
    const payload = { title, content, attendance };

    try {
      const r = await fetch(`/api/classes/${classId}/chamadas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const key = lsKeyCalls(classId);
      const list = JSON.parse(localStorage.getItem(key) || "[]");

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
        localStorage.setItem(key, JSON.stringify([rec, ...(Array.isArray(list) ? list : [])]));
        router.push(`/classes/${classId}/chamadas`);
        return;
      }
      throw new Error("post failed");
    } catch {
      const key = lsKeyCalls(classId);
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      const rec = {
        id: crypto.randomUUID(),
        classId,
        title,
        content,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([rec, ...(Array.isArray(list) ? list : [])]));
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
          {/* Nome da aula */}
          <label className="mb-2 block text-sm font-medium">Nome da aula</label>
          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: Aula 01 - Introdução"
          />

          {/* Linha: Conteúdo (modal) + Adicionar aluno (modal) */}
          <div className="mb-3 flex items-center justify-between">
            <ViewContentModal title={title} content={content} />
            <AddStudentModal onSave={(name, cpf, contact) => handleAddStudent({ name, cpf, contact })} />
          </div>

          {/* Lista editável de alunos (com salvar/cancelar/mais informações) */}
          <EditableStudentList
            classId={classId}
            students={orderedStudents}
            setStudents={setStudents}
            presentMap={presentMap}
            setPresentMap={setPresentMap}
          />

          {/* Botão Criar chamada */}
          <div className="mt-4">
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Criando..." : "Criar chamada"}
            </button>
            <Link
              href={`/classes/${classId}/chamadas`}
              className="ml-3 inline-block rounded-2xl border px-4 py-3 text-sm hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>

          {/* Bloco: adicionar alunos por planilha (abaixo do botão) */}
          <div className="mt-6 rounded-xl border border-dashed p-3">
            <h3 className="mb-2 text-sm font-medium">Adicionar alunos por planilha</h3>
            <p className="mb-2 text-xs text-gray-500">
              CSV ou XLSX com colunas: <strong>nome</strong> (obrigatório), <strong>cpf</strong> e <strong>contact</strong> (opcionais).
            </p>
            <StudentImport classId={classId} existing={orderedStudents} onAdd={handleImported} />
          </div>
        </form>
      </div>
    </main>
  );
}

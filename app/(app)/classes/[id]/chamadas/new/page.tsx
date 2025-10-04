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

export default function CallCreatePage({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
      setStudents(ss);
      const map: Record<string, boolean> = {};
      ss.forEach(s => map[s.id] = true);
      setPresentMap(map);
    })();
  }, [params]);

  const ordered = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")), [students]);

  function togglePresent(id: string) {
    setPresentMap(p => ({ ...p, [id]: !p[id] }));
  }

  function addStudent() {
    const name = prompt("Nome do aluno(a):")?.trim();
    if (!name) return;
    const s: Student = { id: crypto.randomUUID(), name };
    const next = [...students, s];
    setStudents(next);
    localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next));
    setPresentMap(p => ({ ...p, [s.id]: true }));
  }

  function downloadTemplateCSV() {
    const csv = "nome\nAluno 1\nAluno 2\nAluno 3\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "alunos-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const header = (lines.shift() || "").toLowerCase();
    const rows = header.includes("nome") ? lines : [header, ...lines];
    const toAdd: Student[] = [];
    rows.forEach(n => {
      const name = n.replace(/^"+|"+$/g, "");
      if (!name) return;
      if (students.some(s=>s.name===name)) return;
      toAdd.push({ id: crypto.randomUUID(), name });
    });
    if (toAdd.length) {
      const next = [...students, ...toAdd];
      setStudents(next);
      localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next));
      setPresentMap(p => { const m={...p}; toAdd.forEach(s=>m[s.id]=true); return m; });
    }
    e.target.value = "";
  }

  function saveCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    setSaving(true);
    try {
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
      const rec: CallRecord = {
        id: crypto.randomUUID(),
        classId,
        title: title.trim(),
        content: content.trim() || undefined,
        createdAt: new Date().toISOString(),
        attendance: ordered.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
      };
      localStorage.setItem(lsKeyCalls(classId), JSON.stringify([rec, ...calls]));
      alert("Chamada salva!");
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

        <div className="mb-4 flex gap-3">
          <button type="button" onClick={saveCall} disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar chamada"}
          </button>
          <button type="button" onClick={()=>addStudent()}
            className="rounded-2xl border px-4 py-3 text-sm transition hover:border-blue-500 hover:text-blue-600">
            Adicionar aluno
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 p-3">
          <div className="mb-2 text-sm">Adicionar alunos (CSV/XLSX)</div>
          <div className="mb-2 flex items-center gap-3">
            <input type="file" accept=".csv,text/csv" onChange={importCSV} className="text-sm" />
            <button type="button" onClick={downloadTemplateCSV}
              className="rounded-full border px-3 py-1 text-xs transition hover:border-blue-500 hover:text-blue-600">
              planilha padrão
            </button>
          </div>
          <p className="text-xs text-gray-500">CSV com cabeçalho <code>nome</code>.</p>
        </div>
      </div>
    </main>
  );
}

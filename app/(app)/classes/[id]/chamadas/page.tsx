'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Student = { id: string; name: string };
type Attendance = { studentId: string; present: boolean };
type CallRecord = {
  id: string;
  classId: string;
  title: string;        // Nome da aula
  content?: string;     // Conteúdo (resumo/observação)
  createdAt: string;
  attendance: Attendance[];
};

function lsKeyStudents(classId: string) {
  return `guieduc:class:${classId}:students`;
}
function lsKeyCalls(classId: string) {
  return `guieduc:class:${classId}:calls`;
}

function loadStudents(classId: string): Student[] {
  try {
    return JSON.parse(localStorage.getItem(lsKeyStudents(classId)) || "[]");
  } catch {
    return [];
  }
}
function saveStudents(classId: string, list: Student[]) {
  try { localStorage.setItem(lsKeyStudents(classId), JSON.stringify(list)); } catch {}
}
function loadCalls(classId: string): CallRecord[] {
  try {
    return JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
  } catch {
    return [];
  }
}
function saveCalls(classId: string, list: CallRecord[]) {
  try { localStorage.setItem(lsKeyCalls(classId), JSON.stringify(list)); } catch {}
}

export default function ChamadasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [classId, setClassId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Resolve params (Next 15: Promise)
  useEffect(() => {
    let alive = true;
    (async () => {
      const { id } = await params;
      if (!alive) return;
      setClassId(id);
      const ss = loadStudents(id);
      setStudents(ss);
      // default todos presentes
      const map: Record<string, boolean> = {};
      ss.forEach(s => (map[s.id] = true));
      setPresentMap(map);
    })();
    return () => { alive = false; };
  }, [params]);

  // ordena alfabeticamente
  const ordered = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [students]
  );

  function togglePresent(id: string) {
    setPresentMap(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function addStudent() {
    const name = prompt("Nome do aluno(a):")?.trim();
    if (!name) return;
    const s: Student = { id: crypto.randomUUID(), name };
    const next = [...students, s];
    setStudents(next);
    saveStudents(classId, next);
    setPresentMap(p => ({ ...p, [s.id]: true }));
  }

  function downloadTemplateCSV() {
    const csv = "nome\nAluno 1\nAluno 2\nAluno 3\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alunos-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    // CSV simples: primeira coluna "nome", ignora cabeçalho
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const header = lines.shift()?.toLowerCase();
    const names = (header && header.includes("nome")) ? lines : [header!, ...lines];
    const added: Student[] = [];
    names.forEach(n => {
      const name = n.replace(/^"+|"+$/g, "");
      if (!name) return;
      // evita duplicado pelo nome exato
      if (students.some(s => s.name === name)) return;
      added.push({ id: crypto.randomUUID(), name });
    });
    if (added.length) {
      const next = [...students, ...added];
      setStudents(next);
      saveStudents(classId, next);
      setPresentMap(p => {
        const m = { ...p };
        added.forEach(s => (m[s.id] = true));
        return m;
      });
    }
    // limpa input
    e.target.value = "";
  }

  function saveCall() {
    if (!classId) return;
    const trimmed = title.trim();
    if (!trimmed) {
      alert("Informe o nome da aula.");
      return;
    }
    setSaving(true);
    try {
      const calls = loadCalls(classId);
      const rec: CallRecord = {
        id: crypto.randomUUID(),
        classId,
        title: trimmed,
        content: content.trim() || undefined,
        createdAt: new Date().toISOString(),
        attendance: ordered.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
      };
      saveCalls(classId, [rec, ...calls]);
      // feedback simples
      alert("Chamada salva!");
      setTitle("");
      setContent("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <Link href={`/classes/${classId}`} className="text-sm text-blue-600 hover:underline">
        Voltar para Chamadas
      </Link>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Frações — revisão"
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="mb-2 block text-sm font-medium">Conteúdo</label>
        <button
          type="button"
          onClick={() => {
            const v = prompt("Conteúdo/observações da aula:", content || "") ?? "";
            setContent(v);
          }}
          className="mb-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"
        >
          Conteúdo da aula
        </button>

        <div className="mb-2 text-sm font-medium">Lista de alunos ({ordered.length})</div>

        <ul className="mb-4 overflow-hidden rounded-xl border border-gray-200">
          {ordered.map((s, idx) => (
            <li
              key={s.id}
              className={`flex items-center justify-between px-3 py-2 text-sm ${idx % 2 ? "bg-gray-50" : "bg-white"}`}
            >
              <span>{s.name}</span>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!presentMap[s.id]}
                  onChange={() => togglePresent(s.id)}
                />
                <span className="text-gray-600">Presente</span>
              </label>
            </li>
          ))}
          {ordered.length === 0 && (
            <li className="px-3 py-3 text-sm text-gray-500">Nenhum aluno adicionado.</li>
          )}
        </ul>

        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={saveCall}
            disabled={saving || !title.trim()}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar chamada"}
          </button>
          <button
            type="button"
            onClick={addStudent}
            className="rounded-2xl border px-4 py-3 text-sm transition hover:border-blue-500 hover:text-blue-600"
          >
            Adicionar aluno
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 p-3">
          <div className="mb-2 text-sm">Adicionar alunos (CSV/XLSX)</div>
          <div className="mb-2 flex items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv"  /* XLSX pode ser suportado futuramente */
              onChange={importCSV}
              className="text-sm"
            />
            <button
              type="button"
              onClick={downloadTemplateCSV}
              className="rounded-full border px-3 py-1 text-xs transition hover:border-blue-500 hover:text-blue-600"
            >
              planilha padrão
            </button>
          </div>
          <p className="text-xs text-gray-500">
            CSV com cabeçalho <code>nome</code>. Ex.:<br/>nome↵ João↵ Maria↵ Ana
          </p>
        </div>
      </div>
    </main>
  );
}

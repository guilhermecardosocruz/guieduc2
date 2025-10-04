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
      const map: Record<string, boolean> = {}; ss.forEach(s => map[s.id] = true);
      setPresentMap(map);
    })();
  }, [params]);

  const ordered = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")), [students]);

  function addStudent() {
    const name = prompt("Nome do aluno(a): (obrigatório)")?.trim();
    if (!name) return;
    const cpf = prompt("CPF (opcional):")?.trim() || undefined;
    const contact = prompt("Contato (telefone/email) (opcional):")?.trim() || undefined;
    const s: Student = { id: crypto.randomUUID(), name, cpf, contact };
    const next = [...students, s];
    setStudents(next);
    try { localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next)); } catch {}
    setPresentMap(p => ({ ...p, [s.id]: true }));
  }

  function downloadTemplateCSV() {
    const csv = "nome,cpf,contato\nAluno 1,123.456.789-00,(11) 99999-0000\nAluno 2,,aluno2@email.com\nAluno 3,,\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "alunos-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (!lines.length) return;

    // separador vírgula ou ponto-e-vírgula, respeitando aspas
    const splitRow = (row: string) =>
      row.split(/[,;](?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.trim().replace(/^"+|"+$/g, ""));
    const header = splitRow(lines.shift()!.toLowerCase());

    let idxNome = header.findIndex(h => ["nome","name"].includes(h));
    let idxCpf = header.findIndex(h => ["cpf"].includes(h));
    let idxContato = header.findIndex(h => ["contato","contact","contato/telefone","telefone","celular"].includes(h));

    const rows = lines.map(splitRow);
    const toAdd: Student[] = [];
    for (const cols of rows) {
      const nomeVal = idxNome >= 0 ? cols[idxNome] : cols[0];
      const name = (nomeVal || "").trim();
      if (!name) continue; // nome obrigatório
      if (students.some(s => s.name === name)) continue; // evita duplicado simples por nome
      const cpf = idxCpf >= 0 ? (cols[idxCpf] || "").trim() : undefined;
      const contact = idxContato >= 0 ? (cols[idxContato] || "").trim() : undefined;
      toAdd.push({ id: crypto.randomUUID(), name, cpf: cpf || undefined, contact: contact || undefined });
    }
    if (toAdd.length) {
      const next = [...students, ...toAdd];
      setStudents(next);
      try { localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next)); } catch {}
      setPresentMap(p => {
        const m = { ...p };
        toAdd.forEach(s => (m[s.id] = true));
        return m;
      });
    }
    e.target.value = "";
  }

  function saveCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim() || undefined,
        attendance: ordered.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
      };
      fetch(`/api/classes/${classId}/chamadas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) throw new Error("api");
        const created = await res.json();
        // sincroniza local
        const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
        const rec: CallRecord = {
          id: created.id ?? crypto.randomUUID(),
          classId,
          title: created.title ?? payload.title,
          content: created.content ?? payload.content,
          createdAt: created.createdAt ?? new Date().toISOString(),
          attendance: payload.attendance,
        };
        localStorage.setItem(lsKeyCalls(classId), JSON.stringify([rec, ...calls]));
        window.location.href = `/classes/${classId}/chamadas`;
      }).catch(() => {
        // offline
        const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
        const rec: CallRecord = {
          id: crypto.randomUUID(),
          classId,
          title: payload.title,
          content: payload.content,
          createdAt: new Date().toISOString(),
          attendance: payload.attendance,
        };
        localStorage.setItem(lsKeyCalls(classId), JSON.stringify([rec, ...calls]));
        window.location.href = `/classes/${classId}/chamadas`;
      });
    } finally { setSaving(false); }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">Voltar para Chamadas</Link>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input
          value={title} onChange={(e)=>setTitle(e.target.value)}
          placeholder="Ex.: Frações — revisão"
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

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

        <div className="mt-4 mb-4 flex gap-3">
          <button type="button" onClick={saveCall} disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar chamada"}
          </button>
          <button type="button" onClick={addStudent}
            className="rounded-2xl border px-4 py-3 text-sm transition hover:border-blue-500 hover:text-blue-600">
            Adicionar aluno
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 p-3">
          <div className="mb-2 text-sm">Adicionar alunos (CSV)</div>
          <div className="mb-2 flex items-center gap-3">
            <input type="file" accept=".csv,text/csv" onChange={importCSV} className="text-sm" />
            <button type="button" onClick={downloadTemplateCSV}
              className="rounded-full border px-3 py-1 text-xs transition hover:border-blue-500 hover:text-blue-600">
              planilha padrão
            </button>
          </div>
          <p className="text-xs text-gray-500">
            CSV com cabeçalho <code>nome,cpf,contato</code>. Apenas <strong>nome</strong> é obrigatório.
          </p>
        </div>
      </div>
    </main>
  );
}

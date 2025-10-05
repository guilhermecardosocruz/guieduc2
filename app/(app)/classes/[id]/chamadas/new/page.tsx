'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EditableStudentList, { Student } from "@/components/EditableStudentList";
import AddStudentModal from "@/components/AddStudentModal";
import StudentImport from "@/components/StudentImport";
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

export default function CallNewPage({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // carregar turma + alunos (offline-first)
  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      try {
        const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
        setStudents(Array.isArray(ss) ? ss : []);
        // por padrão, marcar todos como presentes ao criar (ajuste se preferir false)
        const map: Record<string, boolean> = {};
        (Array.isArray(ss) ? ss : []).forEach(s => { map[s.id] = true; });
        setPresentMap(map);
      } catch {
        setStudents([]);
        setPresentMap({});
      }
    })();
  }, [params]);

  const orderedStudents = useMemo(
    () => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")),
    [students]
  );

  // modal: adicionar aluno manualmente
  function handleAddStudent(name: string, cpf?: string, contact?: string) {
    const tempId = crypto.randomUUID();
    const newStudent = { id: tempId, name, cpf, contact };

    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);
    try { if (classId) localStorage.setItem(lsKeyStudents(classId), JSON.stringify(nextStudents)); } catch {}
    setPresentMap(prev => ({ ...prev, [tempId]: true }));

    if (classId) {
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
  }

  // planilha: importar CSV/XLSX
  function handleImported(added: any[]) {
    if (!Array.isArray(added) || added.length === 0) return;

    const toAdd = added.map((a:any)=>({
      id: a.id ?? crypto.randomUUID(),
      name: String(a.name||"").trim(),
      cpf: (a.cpf?.toString() ?? "").trim() || undefined,
      contact: (a.contact?.toString() ?? "").trim() || undefined,
    })).filter((s:any)=>s.name);

    setStudents(prev=>{
      const next = Array.isArray(prev) ? [...prev] : [];
      for (const s of toAdd) {
        const dup = next.find(p => p.name === s.name && (p.cpf||"") === (s.cpf||""));
        if (!dup) next.push(s);
      }
      try { if (classId) localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next)); } catch {}
      return next;
    });

    setPresentMap(prev=>{
      const base = prev || {};
      const updated:any = { ...base };
      for (const s of toAdd) updated[s.id] = true;
      return updated;
    });

    if (classId) {
      for (const s of toAdd) {
        fetch(`/api/classes/${classId}/students`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: s.name, cpf: s.cpf, contact: s.contact }),
        }).then(async r=>{
          if(!r.ok) return;
          const created = await r.json();
          if(created?.id && created.id !== s.id){
            setStudents(cur => cur.map(st => st.id===s.id ? { ...st, id: created.id } : st));
            try {
              const saved:any[] = JSON.parse(localStorage.getItem(lsKeyStudents(classId)) || "[]");
              const upd = saved.map(st => st.id===s.id ? { ...st, id: created.id } : st);
              localStorage.setItem(lsKeyStudents(classId), JSON.stringify(upd));
            } catch {}
            setPresentMap(prev=>{
              const p = (prev||{})[s.id] ?? true;
              const { [s.id]:_, ...rest } = (prev||{});
              return { ...rest, [created.id]: p };
            });
          }
        }).catch(()=>{});
      }
    }
  }

  async function createCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    if (!classId) { alert("Turma não carregada."); return; }
    setSaving(true);

    const attendance: Attendance[] = orderedStudents.map(s => ({ studentId: s.id, present: !!presentMap[s.id] }));
    const nowISO = new Date().toISOString();
    const tempId = crypto.randomUUID();

    // salva local primeiro (offline-first)
    try {
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
      const tempCall: CallRecord = {
        id: tempId,
        classId,
        title: title.trim(),
        content: content.trim() || undefined,
        createdAt: nowISO,
        number: null,
        attendance,
      };
      localStorage.setItem(lsKeyCalls(classId), JSON.stringify([tempCall, ...calls]));
    } catch {}

    // tenta API
    try {
      const r = await fetch(`/api/classes/${classId}/chamadas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), content: content.trim() || undefined, attendance }),
      });
      if (r.ok) {
        const created: CallRecord = await r.json();
        // substituir o temp pelo criado (id/number reais)
        try {
          const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
          const idx = calls.findIndex(c => c.id === tempId);
          if (idx >= 0) {
            calls[idx] = { ...created, attendance };
            localStorage.setItem(lsKeyCalls(classId), JSON.stringify(calls));
          }
        } catch {}
      }
      // voltar para lista
      window.location.href = `/classes/${classId}/chamadas`;
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      {/* top bar */}
      <div className="mb-2 flex items-center justify-between">
        <Link href={`/classes/${classId}/chamadas`} className="text-sm text-blue-600 hover:underline">
          Voltar para Chamadas
        </Link>
        <div /> {/* placeholder */}
      </div>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="mb-3 text-lg font-semibold">Nova chamada</h1>

        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex.: Aula 01 - Introdução"
        />

        <label className="mb-2 block text-sm font-medium">Conteúdo</label>
        <ViewContentModal title={title} content={content} />

        {/* toolbar acima da lista: APENAS o modal */}
        <div className="mb-2 flex items-center justify-end">
          <AddStudentModal onSave={handleAddStudent} />
        </div>

        <EditableStudentList
          classId={classId}
          students={orderedStudents}
          setStudents={setStudents}
          presentMap={presentMap}
          setPresentMap={setPresentMap}
        />

        {/* botão criar chamada */}
        <div className="mt-4">
          <button
            type="button"
            onClick={createCall}
            disabled={!title.trim() || saving}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Criando..." : "Criar chamada"}
          </button>
        </div>

        {/* bloco: importar por planilha (FICA ABAIXO DO BOTÃO) */}
        <div className="mt-6 rounded-xl border border-dashed p-3">
          <h3 className="mb-2 text-sm font-medium">Adicionar alunos por planilha</h3>
          <p className="mb-2 text-xs text-gray-500">
            CSV ou XLSX com colunas: <strong>nome</strong> (obrigatório), <strong>cpf</strong> e <strong>contact</strong> (opcionais).
          </p>
          <StudentImport classId={classId} existing={orderedStudents} onAdd={handleImported} />
        </div>
      </div>
    </main>
  );
}

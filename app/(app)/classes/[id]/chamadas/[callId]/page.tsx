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


  async function deleteCall() {
    if (!confirm("Tem certeza que deseja excluir esta chamada? Essa ação não pode ser desfeita.")) return;
    try {
      // tenta excluir no servidor
      await fetch(`/api/classes/${classId}/chamadas/${callId}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});

      // remove do localStorage (fallback/offline)
      try {
        const key = (id: string) => `guieduc:class:${id}:calls`;
        const calls: any[] = JSON.parse(localStorage.getItem(key(classId)) || "[]");
        const next = calls.filter(c => c.id !== callId);
        localStorage.setItem(key(classId), JSON.stringify(next));
      } catch {}

      // volta para a lista
      window.location.href = `/classes/${classId}/chamadas`;
    } catch {
      alert("Não foi possível excluir agora. Tente novamente.");
    }
  }


  async function addStudent() {
    // 1) coleta dados (Nome obrigatório; CPF/Contato opcionais)
    const name = prompt("Nome do aluno(a): (obrigatório)")?.trim();
    if (!name) return;
    const cpf = prompt("CPF (opcional):")?.trim() || undefined;
    const contact = prompt("Contato (telefone/email) (opcional):")?.trim() || undefined;

    // 2) cria aluno temporário (offline-first)
    const tempId = crypto.randomUUID();
    const newStudent = { id: tempId, name, cpf, contact };

    // atualiza estado
    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);

    // localStorage dos alunos da turma
    try {
      const keyStudents = (id: string) => `guieduc:class:${id}:students`;
      localStorage.setItem(keyStudents(classId), JSON.stringify(nextStudents));
    } catch {}

    // marca presente por padrão na chamada atual
    setPresentMap(prev => ({ ...prev, [tempId]: true }));

    // 3) tenta salvar no servidor (se a rota existir)
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, cpf, contact }),
      });
      if (res.ok) {
        const created = await res.json(); // deve conter created.id
        if (created?.id && created.id !== tempId) {
          // substitui id temporário pelo definitivo no estado/local
          setStudents(cur => cur.map(s => s.id === tempId ? { ...s, id: created.id } : s));
          try {
            const keyStudents = (id: string) => `guieduc:class:${id}:students`;
            const saved: any[] = JSON.parse(localStorage.getItem(keyStudents(classId)) || "[]");
            const updated = saved.map((s: any) => s.id === tempId ? { ...s, id: created.id } : s);
            localStorage.setItem(keyStudents(classId), JSON.stringify(updated));
          } catch {}
          // ajusta presentMap para nova chave
          setPresentMap(prev => {
            const { [tempId]: tmp, ...rest } = prev;
            return { ...rest, [created.id]: tmp ?? true };
          });
        }
      }
    } catch {
      // se offline/erro, mantemos só local; tudo bem
    }
  }


  // Modal: adicionar aluno
      }
    } catch {}
    closeAddModal();
  }


  // Modal: adicionar aluno (Criar chamada)
      }
    } catch {}
    closeAddModal();
  }


  // Modal: adicionar aluno (edição)
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCpf, setAddCpf] = useState("");
  const [addContact, setAddContact] = useState("");

  function openAddModal() {
    setAddName(""); setAddCpf(""); setAddContact("");
    setAddOpen(true);
    setTimeout(() => {
      const dlg = document.getElementById("student-add-dialog") as HTMLDialogElement | null;
      dlg?.showModal?.();
    }, 0);
  }
  function closeAddModal() {
    setAddOpen(false);
    const dlg = document.getElementById("student-add-dialog") as HTMLDialogElement | null;
    dlg?.close?.();
  }

  async function saveAddModal() {
    const name = addName.trim();
    const cpf = addCpf.trim() || undefined;
    const contact = addContact.trim() || undefined;
    if (!name) { alert("Nome é obrigatório."); return; }

    const tempId = crypto.randomUUID();
    const newStudent = { id: tempId, name, cpf, contact };

    // atualiza estado/local (offline-first)
    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);
    try {
      const keyStudents = (id: string) => `guieduc:class:${id}:students`;
      localStorage.setItem(keyStudents(classId), JSON.stringify(nextStudents));
    } catch {}
    setPresentMap(prev => ({ ...prev, [tempId]: true }));

    // tenta salvar no servidor (se existir rota POST /students)
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, cpf, contact }),
      });
      if (res.ok) {
        const created = await res.json();
        if (created?.id && created.id !== tempId) {
          setStudents(cur => cur.map(s => s.id === tempId ? { ...s, id: created.id } : s));
          try {
            const keyStudents = (id: string) => `guieduc:class:${id}:students`;
            const saved: any[] = JSON.parse(localStorage.getItem(keyStudents(classId)) || "[]");
            const updated = saved.map((s: any) => s.id === tempId ? { ...s, id: created.id } : s);
            localStorage.setItem(keyStudents(classId), JSON.stringify(updated));
          } catch {}
          setPresentMap(prev => {
            const presentTemp = prev[tempId] ?? true;
            const { [tempId]: _, ...rest } = prev;
            return { ...rest, [created.id]: presentTemp };
          });
        }
      }
    } catch {}
    closeAddModal();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-2 flex items-center justify-between"><Link href={`/classes//chamadas`} className="text-sm text-blue-600 hover:underline">Voltar para Chamadas</Link><button type="button" onClick={deleteCall} className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50" title="Excluir esta chamada">Excluir chamada</button></div>

      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium">Nome da aula</label>
        <input value={title} onChange={(e)=>setTitle(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />

        <label className="mb-2 block text-sm font-medium">Conteúdo</label>
        <button type="button" onClick={() => { const v = prompt("Conteúdo/observações:", content || "") ?? ""; setContent(v); }}
          className="mb-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700">
          Conteúdo da aula
        </button>

        <div className="mb-2 flex items-center justify-between">
  <span className="text-sm font-medium">Lista de alunos ({ordered.length})</span>
  <button type="button" onClick={openAddModal} className="rounded-2xl border px-3 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600">Adicionar aluno</button>
</div>

  {/* Modal: adicionar aluno */}
  <dialog id="student-add-dialog" className="rounded-2xl p-0 backdrop:bg-black/30">
    <form method="dialog" className="w-[90vw] max-w-md rounded-2xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">Adicionar aluno</h3>

      <label className="mb-1 block text-sm text-gray-700">Nome <span className="text-red-500">*</span></label>
      <input
        value={addName} onChange={(e)=>setAddName(e.target.value)}
        className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Nome do aluno(a)" autoFocus
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-700">CPF (opcional)</label>
          <input
            value={addCpf} onChange={(e)=>setAddCpf(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Contato (opcional)</label>
          <input
            value={addContact} onChange={(e)=>setAddContact(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-0000 ou email"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={saveAddModal}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Salvar
        </button>
        <button type="button" onClick={closeAddModal}
          className="rounded-xl border px-4 py-2 text-sm hover:border-gray-400">
          Cancelar
        </button>
      </div>
    </form>
  </dialog>


  {/* Modal: adicionar aluno (Criar chamada) */}
  <dialog id="student-add-dialog" className="rounded-2xl p-0 backdrop:bg-black/30">
    <form method="dialog" className="w-[90vw] max-w-md rounded-2xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-base font-semibold">Adicionar aluno</h3>

      <label className="mb-1 block text-sm text-gray-700">Nome <span className="text-red-500">*</span></label>
      <input
        value={addName} onChange={(e)=>setAddName(e.target.value)}
        className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Nome do aluno(a)" autoFocus
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-700">CPF (opcional)</label>
          <input
            value={addCpf} onChange={(e)=>setAddCpf(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-700">Contato (opcional)</label>
          <input
            value={addContact} onChange={(e)=>setAddContact(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(11) 99999-0000 ou email"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={saveAddModal}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Salvar
        </button>
        <button type="button" onClick={closeAddModal}
          className="rounded-xl border px-4 py-2 text-sm hover:border-gray-400">
          Cancelar
        </button>
      </div>
    </form>
  </dialog>

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

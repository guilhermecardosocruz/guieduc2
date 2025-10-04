'use client';

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

export type Student = { id: string; name: string };

function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }

type Props = {
  classId: string;
  students: Student[];
  setStudents: (next: Student[]) => void;
  presentMap?: Record<string, boolean>;
  setPresentMap?: (up: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
};

export default function EditableStudentList({ classId, students, setStudents, presentMap, setPresentMap }: Props) {
  const ordered = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")), [students]);

  const [editing, setEditing] = useState<null | Student>(null);
  const [tempName, setTempName] = useState("");
  const timerRef = useRef<number | null>(null);

  function persist(next: Student[]) {
    setStudents(next);
    try { localStorage.setItem(lsKeyStudents(classId), JSON.stringify(next)); } catch {}
  }

  function openEdit(s: Student) {
    setEditing(s);
    setTempName(s.name);
    const dlg = document.getElementById("student-edit-dialog") as HTMLDialogElement | null;
    dlg?.showModal?.();
  }
  function closeEdit() {
    const dlg = document.getElementById("student-edit-dialog") as HTMLDialogElement | null;
    dlg?.close?.();
    setEditing(null);
    setTempName("");
  }
  function saveEdit() {
    if (!editing) return;
    const name = tempName.trim();
    if (!name) return;
    const next = students.map(st => st.id === editing.id ? { ...st, name } : st);
    persist(next);
    closeEdit();
  }

  function onMouseDownLong(s: Student) {
    // toque longo / clique longo (~500ms)
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => openEdit(s), 500);
  }
  function clearTimer() {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function togglePresent(id: string) {
    if (!presentMap || !setPresentMap) return;
    setPresentMap(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <ul className="overflow-hidden rounded-xl border border-gray-200">
        {ordered.length === 0 && (
          <li className="px-3 py-3 text-sm text-gray-500">Nenhum aluno adicionado.</li>
        )}
        {ordered.map((s, idx) => (
          <li
            key={s.id}
            className={`flex items-center justify-between px-3 py-2 text-sm ${idx%2 ? "bg-gray-50":"bg-white"}`}
            onDoubleClick={() => openEdit(s)}
            onMouseDown={() => onMouseDownLong(s)}
            onMouseUp={clearTimer}
            onMouseLeave={clearTimer}
            onTouchStart={() => onMouseDownLong(s)}
            onTouchEnd={clearTimer}
          >
            <span className="select-none">{s.name}</span>

            {presentMap && setPresentMap ? (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!presentMap[s.id]}
                  onChange={() => togglePresent(s.id)}
                />
                <span className="text-gray-600">Presente</span>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => openEdit(s)}
                className="rounded-full border px-3 py-1 text-xs transition hover:border-blue-500 hover:text-blue-600"
                title="Editar"
              >
                Editar
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Modal nativo */}
      <dialog id="student-edit-dialog" className="rounded-2xl p-0 backdrop:bg-black/30">
        <form method="dialog" className="w-[90vw] max-w-md rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold">Editar aluno</h3>
          <label className="mb-1 block text-sm text-gray-700">Nome</label>
          <input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            autoFocus
            className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do aluno(a)"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button type="button" onClick={saveEdit}
                className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Salvar
              </button>
              <button type="button" onClick={closeEdit}
                className="rounded-xl border px-4 py-2 text-sm hover:border-gray-400">
                Cancelar
              </button>
            </div>
            {editing && (
              <Link
                href={`/students/${editing.id}`}
                className="text-sm text-gray-600 underline underline-offset-2 hover:text-blue-600"
                title="Mais informações"
              >
                Mais informações
              </Link>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}

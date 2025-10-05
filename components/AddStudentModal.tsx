'use client';

import { useState } from "react";

export default function AddStudentModal({
  label = "Adicionar aluno",
  onSave,
}: {
  label?: string;
  onSave: (name: string, cpf?: string, contact?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [contact, setContact] = useState("");

  function openModal() {
    setName(""); setCpf(""); setContact("");
    setOpen(true);
    setTimeout(() => {
      (document.getElementById("student-add-dialog") as HTMLDialogElement | null)?.showModal?.();
    }, 0);
  }
  function closeModal() {
    setOpen(false);
    (document.getElementById("student-add-dialog") as HTMLDialogElement | null)?.close?.();
  }
  function save() {
    const n = name.trim();
    if (!n) { alert("Nome é obrigatório."); return; }
    onSave(n, cpf.trim() || undefined, contact.trim() || undefined);
    closeModal();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-2xl border px-3 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
      >
        {label}
      </button>

      {/* Modal único nesta página (id estável) */}
      <dialog id="student-add-dialog" className="rounded-2xl p-0 backdrop:bg-black/30">
        <form method="dialog" className="w-[90vw] max-w-md rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold">Adicionar aluno</h3>

          <label className="mb-1 block text-sm text-gray-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            value={name} onChange={(e)=>setName(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do aluno(a)"
            autoFocus
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-700">CPF (opcional)</label>
              <input
                value={cpf} onChange={(e)=>setCpf(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Contato (opcional)</label>
              <input
                value={contact} onChange={(e)=>setContact(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-0000 ou email"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={save}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Salvar
            </button>
            <button type="button" onClick={closeModal}
              className="rounded-xl border px-4 py-2 text-sm hover:border-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

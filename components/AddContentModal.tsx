'use client';
import { useState } from "react";

export type ContentInput = {
  number: number;
  title?: string;
  content?: string;
  objectives?: string;
  activities?: string;
  resources?: string;
  bncc?: string;
};

export default function AddContentModal({ onSave }: { onSave: (c: ContentInput) => void }) {
  const [form, setForm] = useState<ContentInput>({ number: 1 });

  function open() {
    setForm({ number: 1, title: "", content: "", objectives: "", activities: "", resources: "", bncc: "" });
    setTimeout(()=> (document.getElementById("add-content-dialog") as HTMLDialogElement | null)?.showModal?.(), 0);
  }
  function close() { (document.getElementById("add-content-dialog") as HTMLDialogElement | null)?.close?.(); }
  function save() {
    const n = Number(form.number);
    if (!Number.isFinite(n) || n <= 0) { alert("Informe um número de aula válido."); return; }
    onSave({ ...form, number: n });
    close();
  }

  return (
    <>
      <button type="button" onClick={open} className="rounded-2xl border px-3 py-2 text-sm hover:border-blue-500 hover:text-blue-600">
        Adicionar conteúdo
      </button>

      <dialog id="add-content-dialog" className="rounded-2xl p-0 backdrop:bg-black/30">
        <form method="dialog" className="w-[92vw] max-w-2xl rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold">Novo conteúdo</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm">Número da Aula *</label>
              <input type="number" min={1} value={form.number}
                onChange={(e)=>setForm(f=>({ ...f, number: Number(e.target.value) }))}
                className="w-full rounded-xl border px-3 py-2"/>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm">Título</label>
              <input value={form.title||""} onChange={(e)=>setForm(f=>({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2"/>
            </div>
          </div>

          <label className="mt-3 mb-1 block text-sm">Conteúdo da Aula</label>
          <textarea value={form.content||""} onChange={(e)=>setForm(f=>({ ...f, content: e.target.value }))}
            className="h-24 w-full rounded-xl border px-3 py-2"/>

          <label className="mt-3 mb-1 block text-sm">Objetivos</label>
          <textarea value={form.objectives||""} onChange={(e)=>setForm(f=>({ ...f, objectives: e.target.value }))}
            className="h-20 w-full rounded-xl border px-3 py-2"/>

          <label className="mt-3 mb-1 block text-sm">Desenvolvimento das Atividades</label>
          <textarea value={form.activities||""} onChange={(e)=>setForm(f=>({ ...f, activities: e.target.value }))}
            className="h-24 w-full rounded-xl border px-3 py-2"/>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Recursos Didáticos</label>
              <textarea value={form.resources||""} onChange={(e)=>setForm(f=>({ ...f, resources: e.target.value }))}
                className="h-20 w-full rounded-xl border px-3 py-2"/>
            </div>
            <div>
              <label className="mb-1 block text-sm">BNCC</label>
              <textarea value={form.bncc||""} onChange={(e)=>setForm(f=>({ ...f, bncc: e.target.value }))}
                className="h-20 w-full rounded-xl border px-3 py-2"/>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={save} className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Salvar</button>
            <button type="button" onClick={close} className="rounded-xl border px-4 py-2">Cancelar</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

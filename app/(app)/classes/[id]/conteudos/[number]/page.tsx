'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { number:number; title:string; content?:string|null; objectives?:string|null; activities?:string|null; resources?:string|null; bncc?:string|null };

export default function ContentEditPage({ params }: { params: Promise<{ id: string; number: string }> }) {
  const [classId, setClassId] = useState(""); const [num, setNum] = useState<number>(0);
  const [item, setItem] = useState<Item|null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    const { id, number } = await params; setClassId(id); const n = Number(number)||0; setNum(n);
    // local primeiro
    try {
      const arr: Item[] = JSON.parse(localStorage.getItem(`guieduc:class:${id}:contents`) || "[]");
      const local = arr.find(x => x.number === n);
      if (local) setItem(local);
    } catch {}
    // remoto
    try {
      const r = await fetch(`/api/classes/${id}/conteudos/${n}`, { cache: "no-store" });
      if (r.ok) {
        const data = await r.json(); setItem(data);
        const arr: Item[] = JSON.parse(localStorage.getItem(`guieduc:class:${id}:contents`) || "[]");
        const next = [data, ...arr.filter(x => x.number !== n)];
        localStorage.setItem(`guieduc:class:${id}:contents`, JSON.stringify(next));
      }
    } catch {}
  })(); }, [params]);

  async function save() {
    if (!item) return; setSaving(true);
    try {
      const r = await fetch(`/api/classes/${classId}/conteudos/${num}`, {
        method: "PATCH",
        headers: { "content-type":"application/json" },
        body: JSON.stringify(item),
      });
      if (r.ok) {
        const data = await r.json();
        setItem(data);
        const arr: Item[] = JSON.parse(localStorage.getItem(`guieduc:class:${classId}:contents`) || "[]");
        const next = [data, ...arr.filter(x => x.number !== num)];
        localStorage.setItem(`guieduc:class:${classId}:contents`, JSON.stringify(next));
        alert("Conteúdo salvo.");
      } else {
        throw new Error("patch failed");
      }
    } catch {
      // offline: salva local e segue
      const arr: Item[] = JSON.parse(localStorage.getItem(`guieduc:class:${classId}:contents`) || "[]");
      const next = [item, ...arr.filter(x => x.number !== num)];
      localStorage.setItem(`guieduc:class:${classId}:contents`, JSON.stringify(next));
      alert("Sem conexão: alterações guardadas localmente.");
    } finally { setSaving(false); }
  }

  async function del() {
    const ok = confirm(`Excluir conteúdo da Aula ${num}?`); if (!ok) return;
    try {
      await fetch(`/api/classes/${classId}/conteudos/${num}`, { method: "DELETE" });
    } catch {}
    const arr: Item[] = JSON.parse(localStorage.getItem(`guieduc:class:${classId}:contents`) || "[]");
    const next = arr.filter(x => x.number !== num);
    localStorage.setItem(`guieduc:class:${classId}:contents`, JSON.stringify(next));
    location.href = `/classes/${classId}/conteudos`;
  }

  if (!item) return <main className="mx-auto max-w-3xl px-4 py-8"><p className="text-sm text-gray-500">Carregando conteúdo...</p></main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/classes/${classId}/conteudos`} className="text-sm text-blue-600 hover:underline">← Voltar</Link>
        <div className="flex gap-2">
          <button onClick={del} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Excluir aula</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>

      <h1 className="mb-4 text-xl font-semibold">Editar conteúdo — Aula {num}</h1>

      <label className="mb-1 block text-sm font-medium">Título</label>
      <input value={item.title} onChange={e=>setItem({...item!, title:e.target.value})}
             className="mb-3 w-full rounded-lg border px-3 py-2" placeholder="Título" />

      <label className="mb-1 block text-sm font-medium">Conteúdo da Aula</label>
      <textarea value={item.content||""} onChange={e=>setItem({...item!, content:e.target.value})}
                className="mb-3 w-full rounded-lg border px-3 py-2 min-h-[96px]" />

      <label className="mb-1 block text-sm font-medium">Objetivos</label>
      <textarea value={item.objectives||""} onChange={e=>setItem({...item!, objectives:e.target.value})}
                className="mb-3 w-full rounded-lg border px-3 py-2 min-h-[72px]" />

      <label className="mb-1 block text-sm font-medium">Desenvolvimento das Atividades</label>
      <textarea value={item.activities||""} onChange={e=>setItem({...item!, activities:e.target.value})}
                className="mb-3 w-full rounded-lg border px-3 py-2 min-h-[72px]" />

      <label className="mb-1 block text-sm font-medium">Recursos Didáticos</label>
      <textarea value={item.resources||""} onChange={e=>setItem({...item!, resources:e.target.value})}
                className="mb-3 w-full rounded-lg border px-3 py-2 min-h-[72px]" />

      <label className="mb-1 block text-sm font-medium">BNCC</label>
      <textarea value={item.bncc||""} onChange={e=>setItem({...item!, bncc:e.target.value})}
                className="mb-6 w-full rounded-lg border px-3 py-2 min-h-[72px]" />
    </main>
  );
}

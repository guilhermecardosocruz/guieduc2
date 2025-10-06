'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ContentItem = {
  id?: string;
  number: number;
  title: string;
  content?: string|null;
  objectives?: string|null;
  activities?: string|null;
  resources?: string|null;
  bncc?: string|null;
  createdAt?: string;
};

const lsKey = (id: string) => `guieduc:class:${id}:contents`;

export default function ContentEditPage({ params }: { params: Promise<{ id: string; number: string }> }) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [number, setNumber] = useState<number>(0);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [objectives, setObjectives] = useState("");
  const [activities, setActivities] = useState("");
  const [resources, setResources] = useState("");
  const [bncc, setBncc] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const { id, number } = await params;
      setClassId(id);
      const n = Number(number); setNumber(n);

      // local primeiro
      try {
        const local = JSON.parse(localStorage.getItem(lsKey(id)) || "[]") as ContentItem[];
        const found = local.find(c => c.number === n);
        if (found) {
          setTitle(found.title || "");
          setContent(found.content || "");
          setObjectives(found.objectives || "");
          setActivities(found.activities || "");
          setResources(found.resources || "");
          setBncc(found.bncc || "");
        }
      } catch {}

      // remoto
      try {
        const r = await fetch(`/api/classes/${id}/conteudos/${n}`, { cache: "no-store" });
        if (r.ok) {
          const d: ContentItem = await r.json();
          setTitle(d.title || "");
          setContent(d.content || "");
          setObjectives(d.objectives || "");
          setActivities(d.activities || "");
          setResources(d.resources || "");
          setBncc(d.bncc || "");

          // persistir merge local
          try {
            const cur: ContentItem[] = JSON.parse(localStorage.getItem(lsKey(id)) || "[]");
            const idx = cur.findIndex(c => c.number === n);
            if (idx >= 0) cur[idx] = { ...cur[idx], ...d }; else cur.unshift(d);
            localStorage.setItem(lsKey(id), JSON.stringify(cur));
          } catch {}
        }
      } catch {}
    })();
  }, [params]);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    if (!classId || !number || !title.trim() || saving) return;
    setSaving(true);
    const payload = { title, content, objectives, activities, resources, bncc };
    try {
      await fetch(`/api/classes/${classId}/conteudos/${number}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(()=>{});
    } finally {
      // salva no local e permanece
      try {
        const cur: ContentItem[] = JSON.parse(localStorage.getItem(lsKey(classId)) || "[]");
        const idx = cur.findIndex(c => c.number === number);
        const merged: ContentItem = { ...(idx>=0?cur[idx]:{} as any), number, title, content, objectives, activities, resources, bncc };
        if (idx>=0) cur[idx]=merged; else cur.unshift(merged);
        localStorage.setItem(lsKey(classId), JSON.stringify(cur));
      } catch {}
      setSaving(false);
    }
  }

  async function removeItem() {
    if (!confirm("Excluir este conteúdo?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/classes/${classId}/conteudos/${number}`, { method: "DELETE" }).catch(()=>{});
    } finally {
      try {
        const cur: ContentItem[] = JSON.parse(localStorage.getItem(lsKey(classId)) || "[]");
        const next = cur.filter(c => c.number !== number);
        localStorage.setItem(lsKey(classId), JSON.stringify(next));
      } catch {}
      router.push(`/classes/${classId}/conteudos`);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/classes/${classId}/conteudos`} className="text-sm text-blue-600 hover:underline">
          Voltar para Conteúdos
        </Link>
        <button
          type="button"
          onClick={removeItem}
          disabled={deleting}
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form onSubmit={save}>
          <div className="mb-2 text-xs text-gray-500">Conteúdo nº {number}</div>

          <label className="mb-2 block text-sm font-medium">Título</label>
          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: Aula 05 — Frações"
          />

          <label className="mb-1 block text-sm font-medium">Conteúdo da Aula</label>
          <textarea
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />

          <label className="mb-1 block text-sm font-medium">Objetivos</label>
          <textarea value={objectives} onChange={(e)=>setObjectives(e.target.value)} className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" rows={3} />

          <label className="mb-1 block text-sm font-medium">Desenvolvimento das Atividades</label>
          <textarea value={activities} onChange={(e)=>setActivities(e.target.value)} className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" rows={3} />

          <label className="mb-1 block text-sm font-medium">Recursos Didáticos</label>
          <textarea value={resources} onChange={(e)=>setResources(e.target.value)} className="mb-3 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" rows={3} />

          <label className="mb-1 block text-sm font-medium">BNCC</label>
          <textarea value={bncc} onChange={(e)=>setBncc(e.target.value)} className="mb-4 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" rows={3} />

          <div className="mt-2 flex items-center gap-3">
            <button type="submit" disabled={!title.trim() || saving} className="rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link href={`/classes/${classId}/conteudos`} className="rounded-2xl border px-4 py-3 text-sm hover:bg-gray-50">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

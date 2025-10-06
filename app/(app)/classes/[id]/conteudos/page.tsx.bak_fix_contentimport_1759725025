'use client';

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import AddContentModal, { ContentInput } from "@/components/AddContentModal";
import ContentImport from "@/components/ContentImport";

type ContentItem = {
  id?: string;
  number?: number|null;
  title: string;
  content?: string|null;
  objectives?: string|null;
  activities?: string|null;
  resources?: string|null;
  bncc?: string|null;
  createdAt?: string;
};

const lsKey = (id: string) => `guieduc:class:${id}:contents`;

function sortContents(arr: ContentItem[]) {
  const a = [...arr];
  a.sort((x,y) => {
    const xn = typeof x.number === "number" ? x.number : Infinity;
    const yn = typeof y.number === "number" ? y.number : Infinity;
    if (xn !== yn) return xn - yn;
    return (x.createdAt||"").localeCompare(y.createdAt||"");
  });
  return a;
}

export default function ContentsIndex({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState("");
  const [list, setList] = useState<ContentItem[]>([]);
  const ref = useRef<ContentItem[]>([]);

  function setSafe(next: ContentItem[]) {
    try { if (JSON.stringify(ref.current) !== JSON.stringify(next)) { ref.current = next; setList(next); } }
    catch { ref.current = next; setList(next); }
  }

  async function load(id: string) {
    // local primeiro
    try {
      const local: ContentItem[] = JSON.parse(localStorage.getItem(lsKey(id)) || "[]");
      setSafe(sortContents(local));
    } catch { setSafe([]); }

    // remoto
    try {
      const r = await fetch(`/api/classes/${id}/conteudos`, { cache: "no-store" });
      if (r.ok) {
        const remote: ContentItem[] = await r.json();
        const merged = sortContents(remote);
        localStorage.setItem(lsKey(id), JSON.stringify(merged));
        setSafe(merged);
      }
    } catch {}
  }

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      load(id);
    })();
  }, [params]);

  async function handleAdd(data: ContentInput) {
    if (!classId) return;
    // POST upsert por número (a API calcula number se vazio)
    const r = await fetch(`/api/classes/${classId}/conteudos`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).catch(()=>null);

    // salva no local para aparecer já
    const cur: ContentItem[] = JSON.parse(localStorage.getItem(lsKey(classId)) || "[]");
    if (r && r.ok) {
      const saved: ContentItem = await r.json();
      const next = sortContents([saved, ...cur.filter(c => !(typeof c.number==='number' && c.number===saved.number))]);
      localStorage.setItem(lsKey(classId), JSON.stringify(next));
      setSafe(next);
    } else {
      const temp: ContentItem = {
        id: crypto.randomUUID(),
        title: data.title || `Aula`,
        content: data.content || "",
        objectives: data.objectives || "",
        activities: data.activities || "",
        resources: data.resources || "",
        bncc: data.bncc || "",
        createdAt: new Date().toISOString(),
      };
      const next = sortContents([temp, ...cur]);
      localStorage.setItem(lsKey(classId), JSON.stringify(next));
      setSafe(next);
    }
  }

  const rendered = useMemo(() => sortContents(list), [list]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conteúdos</h1>
        <AddContentModal onSave={handleAdd} />
      </div>

      {!rendered.length ? (
        <p className="text-sm text-gray-500">Nenhum conteúdo cadastrado ainda.</p>
      ) : (
        <ul className="divide-y rounded-2xl border border-gray-200 bg-white">
          {rendered.map(c => (
            <li key={(c.number ?? c.id) as any} className="p-0">
              <Link
                href={`/classes/${classId}/conteudos/${c.number ?? 0}`}
                className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
                title="Editar conteúdo"
              >
                {typeof c.number === "number" && (
                  <span className="text-xs tabular-nums text-gray-700">{c.number}</span>
                )}
                <span>{c.title || "Sem título"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 rounded-xl border border-dashed p-3">
        <h3 className="mb-2 text-sm font-medium">Adicionar conteúdos por planilha</h3>
        <p className="mb-2 text-xs text-gray-500">
          CSV ou XLSX com colunas: <strong>Número da Aula</strong> (opcional),
          <strong> Título</strong>, <strong>Conteúdo da Aula</strong>, <strong>Objetivos</strong>,
          <strong> Desenvolvimento das Atividades</strong>, <strong>Recursos Didáticos</strong>, <strong>BNCC</strong>.
        </p>
        <ContentImport classId={classId} />
      </div>
    </main>
  );
}

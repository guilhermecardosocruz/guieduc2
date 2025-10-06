'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AddContentModal, { ContentInput } from "@/components/AddContentModal";
import DeleteAllContentsButton from "@/components/DeleteAllContentsButton";
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
  const router = useRouter();
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
    const r = await fetch(`/api/classes/${classId}/conteudos`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    }).catch(()=>null);

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

  function handleImported(rows: any[]) {
    if (!Array.isArray(rows) || !classId) return;
    const norm = (s:any) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
    (async () => {
      for (const raw of rows) {
        const obj = Object.fromEntries(Object.entries(raw || {}).map(([k, v]) => [norm(k), v]));
        const data: ContentInput = {
          number:     (obj["numero da aula"] ?? obj["numero"] ?? obj["number"]) as any,
          title:      String(obj["titulo"] ?? obj["title"] ?? obj["título"] ?? ""),
          content:    String(obj["conteudo da aula"] ?? obj["conteudo"] ?? obj["content"] ?? ""),
          objectives: String(obj["objetivos"] ?? obj["objectives"] ?? ""),
          activities: String(obj["desenvolvimento das atividades"] ?? obj["atividades"] ?? obj["activities"] ?? ""),
          resources:  String(obj["recursos didaticos"] ?? obj["recursos"] ?? obj["resources"] ?? ""),
          bncc:       String(obj["bncc"] ?? ""),
        };
        await handleAdd(data);
      }
    })();
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2">Aula</th>
                <th className="px-4 py-2">Título</th>
                <th className="px-4 py-2">Conteúdo da Aula</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rendered.map(c => {
                const rowClickable = typeof c.number === "number";
                const go = () => { if (rowClickable) router.push(`/classes/${classId}/conteudos/${c.number}`); };
                return (
                  <tr
                    key={(c.number ?? c.id) as any}
                    onClick={go}
                    className={`cursor-pointer hover:bg-gray-50 ${rowClickable ? '' : 'opacity-70 cursor-not-allowed'}`}
                    role="link"
                    tabIndex={rowClickable ? 0 : -1}
                  >
                    <td className="px-4 py-3 tabular-nums">{typeof c.number==='number' ? c.number : ''}</td>
                    <td className="px-4 py-3">{c.title || "Sem título"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.content || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-dashed p-3">
        <h3 className="mb-2 text-sm font-medium">Importar por planilha</h3>
        <p className="mb-2 text-xs text-gray-500">
          CSV ou XLSX com colunas: <strong>numero da Aula</strong> (opcional),
          <strong> Título</strong>, <strong>Conteúdo da Aula</strong>, <strong>Objetivos</strong>,
          <strong> Desenvolvimento das Atividades</strong>, <strong>Recursos Didáticos</strong>, <strong>BNCC</strong>.
        </p>
        <ContentImport onAdd={handleImported} />
      </div>
    </main>
  );
}

'use client';
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AddContentModal, { ContentInput } from "@/components/AddContentModal";
import ContentImport from "@/components/ContentImport";

type ContentRow = {
  id: string; number: number; title: string;
  content?: string; objectives?: string; activities?: string; resources?: string; bncc?: string;
  createdAt: string;
};

export default function ContentsPage({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState("");
  const [items, setItems] = useState<ContentRow[]>([]);
  const [order, setOrder] = useState<"asc"|"desc">("asc");

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      try {
        const r = await fetch(`/api/classes/${id}/conteudos`, { cache: "no-store" });
        if (r.ok) setItems(await r.json());
      } catch {}
    })();
  }, [params]);

  const list = useMemo(() => {
    const arr = [...items];
    arr.sort((a,b)=> order==="asc" ? a.number-b.number : b.number-a.number);
    return arr;
  }, [items, order]);

  async function addManual(input: ContentInput){
    const r = await fetch(`/api/classes/${classId}/conteudos`, {
      method: "POST", headers: { "content-type": "application/json" }, credentials: "include",
      body: JSON.stringify(input),
    });
    if (r.ok) {
      const saved: ContentRow = await r.json();
      setItems(cur => {
        const idx = cur.findIndex(x => x.id === saved.id);
        if (idx >= 0) { const next = [...cur]; next[idx] = saved; return next; }
        return [...cur, saved];
      });
    }
  }

  async function importRows(rows: any[]){
    const valid = (rows||[]).filter((r:any) => Number(r.number) > 0);
    if (!valid.length) { alert("Nenhuma linha válida."); return; }
    const r = await fetch(`/api/classes/${classId}/conteudos/import`, {
      method: "POST", headers: { "content-type": "application/json" }, credentials: "include",
      body: JSON.stringify(valid),
    });
    if (r.ok) {
      const list = await (await fetch(`/api/classes/${classId}/conteudos`, { cache: "no-store" })).json();
      setItems(list);
      alert(`Importadas ${valid.length} linha(s).`);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <Link href={`/classes/${classId}`} className="text-sm text-blue-600 hover:underline">Voltar para Turma</Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Ordem:</span>
          <button onClick={()=>setOrder(prev=>prev==="asc"?"desc":"asc")}
            className="rounded-xl border px-3 py-1 text-sm hover:border-blue-500 hover:text-blue-600">
            {order==="asc"?"1 → 99":"99 → 1"}
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Conteúdos</h1>
        <AddContentModal onSave={addManual} />
      </div>

      {!list.length ? (
        <p className="text-sm text-gray-500">Nenhum conteúdo cadastrado.</p>
      ) : (
        <div className="overflow-auto rounded-2xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 w-20">Aula</th>
                <th className="p-3 w-64">Título</th>
                <th className="p-3 min-w-[16rem]">Conteúdo da Aula</th>
                <th className="p-3 min-w-[14rem]">Objetivos</th>
                <th className="p-3 min-w-[18rem]">Desenvolvimento das Atividades</th>
                <th className="p-3 min-w-[14rem]">Recursos Didáticos</th>
                <th className="p-3 min-w-[10rem]">BNCC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(row=>(
                <tr key={row.id} className="align-top">
                  <td className="p-3 tabular-nums">{row.number}</td>
                  <td className="p-3">{row.title}</td>
                  <td className="p-3 whitespace-pre-wrap">{row.content}</td>
                  <td className="p-3 whitespace-pre-wrap">{row.objectives}</td>
                  <td className="p-3 whitespace-pre-wrap">{row.activities}</td>
                  <td className="p-3 whitespace-pre-wrap">{row.resources}</td>
                  <td className="p-3 whitespace-pre-wrap">{row.bncc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-dashed p-3">
        <h3 className="mb-2 text-sm font-medium">Importar por planilha</h3>
        <p className="mb-2 text-xs text-gray-500">
          CSV ou XLSX com colunas: <strong>numero da Aula</strong>, <strong>Título</strong>, <strong>Conteúdo da Aula</strong>,
          <strong> Objetivos</strong>, <strong>Desenvolvimento das Atividades</strong>, <strong>Recursos Didáticos</strong>, <strong>BNCC</strong>.
        </p>
        <ContentImport onAdd={importRows} />
      </div>
    </main>
  );
}

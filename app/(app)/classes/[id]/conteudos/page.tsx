'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import AddContentModal from "@/components/AddContentModal";
import DeleteAllContentsButton from "@/components/DeleteAllContentsButton";
import ContentImport from "@/components/ContentImport";

type ContentItem = {
  number: number;
  title: string;
  content?: string | null;
  objectives?: string | null;
  activities?: string | null;
  resources?: string | null;
  bncc?: string | null;
  createdAt?: string;
};

const lsKey = (id: string) => `guieduc:class:${id}:contents`;

export default function ContentsPage({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState("");
  const [list, setList] = useState<ContentItem[]>([]);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      try {
        const arr: ContentItem[] = null // offline-off || "[]");
        setList(
          arr
            .filter(x => typeof x?.number === "number")
            .sort((a,b) => (a.number||0) - (b.number||0))
        );
      } catch {
        setList([]);
      }
    })();
  }, [params]);

  function handleImported(rows: any[]) {
    // Normaliza cabeçalhos comuns (pt/en)
    const norm = (s: any) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const current: ContentItem[] = null // offline-off || "[]");
    const map = new Map<number, ContentItem>(current.map(i => [i.number, i]));

    for (const raw of rows) {
      const obj = Object.fromEntries(Object.entries(raw || {}).map(([k, v]) => [norm(k), v]));

      const numRaw = obj["numero da aula"] ?? obj["numero"] ?? obj["number"];
      const number = Number(numRaw);
      if (!Number.isFinite(number) || number <= 0) continue;

      const item: ContentItem = {
        number,
        title: String(obj["titulo"] ?? obj["title"] ?? obj["título"] ?? `Aula ${number}`),
        content: String(obj["conteudo da aula"] ?? obj["conteudo"] ?? obj["content"] ?? ""),
        objectives: String(obj["objetivos"] ?? obj["objectives"] ?? ""),
        activities: String(obj["desenvolvimento das atividades"] ?? obj["atividades"] ?? obj["activities"] ?? ""),
        resources: String(obj["recursos didaticos"] ?? obj["recursos"] ?? obj["resources"] ?? ""),
        bncc: String(obj["bncc"] ?? ""),
      };

      map.set(number, item);
    }

    const next = Array.from(map.values()).sort((a,b) => a.number - b.number);
    localStorage.setItem(lsKey(classId), JSON.stringify(next));
    setList(next);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* header: título + ações */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conteúdos</h1>
        <div className="flex items-center gap-2">
          <DeleteAllContentsButton classId={classId} onDeleted={() => setList([])} />
          <AddContentModal onSave={(c:any) => {
            try {
              const arr: ContentItem[] = null // offline-off || "[]");
              const filtered = arr.filter(i => i.number !== c?.number);
              const next = [c, ...filtered].sort((a,b) => a.number - b.number);
              localStorage.setItem(lsKey(classId), JSON.stringify(next));
              setList(next);
            } catch {}
          }} />
        </div>
      </div>

      {/* tabela/lista */}
      {!list.length ? (
        <p className="text-sm text-gray-500">Nenhum conteúdo cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3">Aula</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Conteúdo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((c) => (
                <tr key={c.number}
                    onClick={() => typeof c.number==="number" && (location.href = `/classes/${classId}/conteudos/${c.number}`)}
                    className={`hover:bg-gray-50 ${typeof c.number==="number" ? "cursor-pointer" : "opacity-70 cursor-not-allowed"}`}>
                  <td className="px-4 py-3 tabular-nums">{c.number}</td>
                  <td className="px-4 py-3">{c.title || `Aula ${c.number}`}</td>
                  <td className="px-4 py-3 truncate max-w-[420px]">{c.content || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* importar por planilha */}
      <div className="mt-6 rounded-xl border border-dashed p-3">
        <h3 className="mb-2 text-sm font-medium">Adicionar conteúdos por planilha</h3>
        <p className="mb-2 text-xs text-gray-500">
          CSV/XLSX com colunas: <strong>Número da Aula</strong>, <strong>Título</strong>, <strong>Conteúdo da Aula</strong>,
          <strong> Objetivos</strong>, <strong>Desenvolvimento das Atividades</strong>, <strong>Recursos Didáticos</strong>, <strong>BNCC</strong>.
        </p>
        <ContentImport onAdd={handleImported} />
      </div>
    </main>
  );
}

'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lesson = { id: string; title: string; createdAt: string; number?: number | null };
const prefKey = (id: string) => `guieduc:class:${id}:callsOrder`;
const lsKey = (id: string) => `guieduc:class:${id}:calls`;

export default function CallsIndex({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [order, setOrder] = useState<"asc"|"desc">("desc");
  const [list, setList] = useState<Lesson[]>([]);

  function readLocal(id: string, ord: "asc"|"desc") {
    try {
      const arr: Lesson[] = JSON.parse(localStorage.getItem(lsKey(id)) || "[]");
      arr.sort((a,b) => {
        const an = a.number ?? 0, bn = b.number ?? 0;
        if (an !== bn) return ord === "asc" ? an - bn : bn - an;
        return ord === "asc"
          ? (a.createdAt || "").localeCompare(b.createdAt || "")
          : (b.createdAt || "").localeCompare(a.createdAt || "");
      });
      return arr;
    } catch { return []; }
  }

  async function load(id: string, ord: "asc"|"desc") {
    setList(readLocal(id, ord)); // mostra local primeiro
    try {
      const r = await fetch(`/api/classes/${id}/chamadas?order=${ord}`, { cache: "no-store" });
      if (r.ok) {
        const apiList: Lesson[] = await r.json();
        if (apiList.length > 0) setList(apiList);
      }
    } catch {}
  }

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setClassId(id);
      const stored = (typeof window !== "undefined" ? localStorage.getItem(prefKey(id)) : null) as "asc"|"desc"|null;
      const ord = stored === "asc" ? "asc" : "desc";
      setOrder(ord);
      await load(id, ord);
      setTimeout(() => router.refresh(), 50);
    })();
  }, [params, router]);

  function toggleOrder() {
    const next = order === "asc" ? "desc" : "asc";
    setOrder(next);
    if (classId) {
      localStorage.setItem(prefKey(classId), next);
      load(classId, next);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamadas</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleOrder}
            className="rounded-xl border px-3 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
            title="Alternar ordenação"
          >
            Ordem: {order === "asc" ? "Antigas → Novas" : "Novas → Antigas"}
          </button>
          <Link
            href={`/classes/${classId}/chamadas/new`}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Nova chamada
          </Link>
        </div>
      </header>

      {!list.length ? (
        <p className="text-sm text-gray-500">Nenhuma chamada criada ainda.</p>
      ) : (
        <ul className="divide-y rounded-2xl border border-gray-200 bg-white">
          {list.map(c => (
            <li key={c.id} className="p-0">
              <Link
                href={`/classes/${classId}/chamadas/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50"
                title="Editar chamada"
              >
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-2 text-xs text-gray-700">
                  #{c.number ?? "—"}
                </span>
                <span>
                  {c.title || "Sem título"} — {new Date(c.createdAt).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

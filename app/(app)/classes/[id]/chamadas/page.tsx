'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  createdAt: string;
  number?: number | null;
  content?: string | null;
};

const prefKey = (id: string) => `guieduc:class:${id}:callsOrder`;
const lsKey   = (id: string) => `guieduc:class:${id}:calls`;

function sortCalls(arr: Lesson[], ord: "asc" | "desc") {
  const a = [...arr];
  a.sort((x, y) => {
    const xn = typeof x.number === "number" ? x.number : Infinity;
    const yn = typeof y.number === "number" ? y.number : Infinity;
    if (xn !== yn) return ord === "asc" ? xn - yn : yn - xn;
    const xd = x.createdAt || "";
    const yd = y.createdAt || "";
    return ord === "asc" ? xd.localeCompare(yd) : yd.localeCompare(xd);
  });
  return a;
}

function mergeCalls(local: Lesson[], remote: Lesson[]) {
  // dedup por id; quando não houver id, usa chave derivada (title+createdAt)
  const keyOf = (c: Lesson) => c.id || `${(c.title||"").trim().toLowerCase()}#${c.createdAt||""}`;
  const map = new Map<string, Lesson>();
  for (const c of local) map.set(keyOf(c), c);
  for (const c of remote) {
    const k = keyOf(c);
    const prev = map.get(k);
    // preferir versão com number/createdAt/ids do servidor
    if (!prev) map.set(k, c);
    else {
      map.set(k, {
        ...prev,
        ...c,
        number: typeof c.number === "number" ? c.number : prev.number,
        createdAt: c.createdAt || prev.createdAt,
      });
    }
  }
  return Array.from(map.values());
}

export default function CallsIndex({ params }: { params: Promise<{ id: string }> }) {
  const [classId, setClassId] = useState("");
  const [order, setOrder] = useState<"asc"|"desc">("desc");
  const [list, setList] = useState<Lesson[]>([]);
  const listRef = useRef<Lesson[]>([]);

  function setListSafe(next: Lesson[]) {
    try {
      if (JSON.stringify(listRef.current) !== JSON.stringify(next)) {
        listRef.current = next; setList(next);
      }
    } catch { listRef.current = next; setList(next); }
  }

  async function loadAll(id: string, ord: "asc"|"desc") {
    // 1) local primeiro
    try {
      const local: Lesson[] = null // offline-off || "[]");
      setListSafe(sortCalls(local, ord));
    } catch { setListSafe([]); }

    // 2) remoto e merge (silencioso se falhar)
    try {
      const r = await fetch(`/api/classes/${id}/chamadas?order=${ord}`, { cache: "no-store" });
      if (r.ok) {
        const remote: Lesson[] = await r.json();
        const local: Lesson[] = null // offline-off || "[]");
        const merged = sortCalls(mergeCalls(local, remote), ord);
        localStorage.setItem(lsKey(id), JSON.stringify(merged));
        setListSafe(merged);
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
      loadAll(id, ord);
    })();
  }, [params]);

  function toggleOrder() {
    const next = order === "asc" ? "desc" : "asc";
    setOrder(next);
    if (classId) {
      localStorage.setItem(prefKey(classId), next);
      loadAll(classId, next);
    }
  }

  const rendered = useMemo(() => sortCalls(list, order), [list, order]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* título + Nova chamada */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamadas</h1>
        <Link
          href={`/classes/${classId}/chamadas/new`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nova chamada
        </Link>
      </div>

      {/* controle de ordenação */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs text-gray-500">Ordenação:</span>
        <button
          type="button"
          onClick={toggleOrder}
          className="rounded-xl border px-3 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
          title="Alternar ordenação"
        >
          {order === "asc" ? "Antigas → Novas" : "Novas → Antigas"}
        </button>
      </div>

      {!rendered.length ? (
        <p className="text-sm text-gray-500">Nenhuma chamada criada ainda.</p>
      ) : (
        <ul className="divide-y rounded-2xl border border-gray-200 bg-white">
          {rendered.map(c => (
            <li key={c.id} className="p-0">
              <Link
                href={`/classes/${classId}/chamadas/${c.id}`}
                className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
                title="Editar chamada"
              >
                {typeof c.number === "number" && (
                  <span className="text-xs tabular-nums text-gray-700">{c.number}</span>
                )}
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

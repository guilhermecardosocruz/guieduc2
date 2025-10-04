'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lesson = { id: string; title: string; createdAt: string };
function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }

export default function CallsIndex({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [list, setList] = useState<Lesson[]>([]);

  function readLocal(id: string): Lesson[] {
    try {
      const arr: Lesson[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
      arr.sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""));
      return arr;
    } catch { return []; }
  }

  async function load(id: string) {
    // 1) mostra local imediatamente
    setList(readLocal(id));

    // 2) tenta API; só substitui se vier COM itens
    try {
      const r = await fetch(`/api/classes/${id}/chamadas`, { cache: "no-store", credentials: "include" });
      if (r.ok) {
        const apiList: Lesson[] = await r.json();
        apiList.sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""));
        if (apiList.length > 0) setList(apiList);
        // se vier vazio, mantemos o local (não sobrescreve)
      }
    } catch {
      // em erro de rede, manter local
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      const { id } = await params;
      if (!alive) return;
      setClassId(id);
      await load(id);
      // pequeno refresh para reidratar navegação
      setTimeout(() => router.refresh(), 50);
    })();
    return () => { alive = false; };
  }, [params, router]);

  // escuta mudanças do storage (outra aba/offline)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (classId && e.key === lsKeyCalls(classId)) setList(readLocal(classId));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [classId]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamadas</h1>
        <Link href={`/classes/${classId}/chamadas/new`} className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nova chamada
        </Link>
      </header>

      {!list.length ? (
        <p className="text-sm text-gray-500">Nenhuma chamada criada ainda.</p>
      ) : (
        <ul className="divide-y rounded-2xl border border-gray-200 bg-white">
          {list.map(c => (
            <li key={c.id} className="p-0">
              <Link href={`/classes/${classId}/chamadas/${c.id}`} className="block px-4 py-3 text-sm hover:bg-gray-50">
                {c.title || "Sem título"} — {new Date(c.createdAt).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

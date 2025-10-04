"use client";
import { useEffect, useState } from "react";
import Brand from "@/components/Brand";
import { saveMany, getAll } from "@/lib/offline";

type ClassItem = { id: string; name: string; updatedAt: number };

export default function DashboardPage() {
  const [items, setItems] = useState<ClassItem[]>([]);
  const [source, setSource] = useState<"server"|"cache"|"none">("none");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/classes", { cache: "no-store" });
        if (!res.ok) throw 0;
        const data: ClassItem[] = await res.json();
        await saveMany("classes", data, x => x.id);
        setItems(data); setSource("server");
      } catch {
        const cached = await getAll<ClassItem>("classes");
        setItems(cached); setSource("cache");
      }
    })();
  }, []);

  function fakeLogout(){ location.href="/login"; }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {source !== "none" && <span>⚡ {source === "server" ? "Dados do servidor" : "Dados locais"}</span>}
            <button onClick={fakeLogout} className="btn-primary">Sair</button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Acesso protegido por JWT em cookie HttpOnly.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.length === 0 && <div className="rounded-3xl border border-gray-100 p-6 bg-white">Sem dados ainda.</div>}
            {items.map(c => (
              <div key={c.id} className="rounded-3xl border border-gray-100 p-6 bg-white">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">Atualizado: {new Date(c.updatedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-gray-500">© GUIEDUC2 — multiplataforma (Web / Android / iOS)</div>
      </footer>
    </div>
  );
}

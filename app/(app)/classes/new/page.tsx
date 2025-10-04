'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ClassItem = { id: string; name: string; createdAt: string };
const LS_KEY = "guieduc:classes";

async function apiList(): Promise<ClassItem[]> {
  try {
    const res = await fetch("/api/classes", { cache: "no-store", credentials: "include" });
    if (!res.ok) throw new Error("API list failed");
    return await res.json();
  } catch {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  }
}

async function apiCreate(name: string): Promise<ClassItem> {
  const optimistic: ClassItem = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
  try {
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("API create failed");
    return await res.json();
  } catch {
    const current = (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
    })() as ClassItem[];
    const dupeNameCount = current.filter(c => c.name === name).length;
    const safe = { ...optimistic, name: dupeNameCount ? `${name} (${dupeNameCount + 1})` : name };
    localStorage.setItem(LS_KEY, JSON.stringify([safe, ...current]));
    return safe;
  }
}

export default function NewClassPage() {
  const [list, setList] = useState<ClassItem[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const canCreate = useMemo(() => name.trim().length >= 2 && !busy, [name, busy]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await apiList();
      if (!alive) return;
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setList(data);
    })();
    return () => { alive = false; };
  }, []);

  async function handleCreate(e?: React.SyntheticEvent) {
    e?.preventDefault(); e?.stopPropagation();
    if (!canCreate) return;
    setBusy(true);
    const trimmed = name.trim();
    setName("");

    const temp: ClassItem = { id: "tmp-" + crypto.randomUUID(), name: trimmed, createdAt: new Date().toISOString() };
    setList(prev => [temp, ...prev]);

    try {
      const created = await apiCreate(trimmed);
      setList(prev => prev.map(it => (it.id === temp.id ? created : it)));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
  }, [list]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Criar Turma</h1>
        <p className="text-sm text-gray-600">Adicione e veja abaixo. O cartão é fininho e clicável.</p>
      </header>

      <div className="mb-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da turma (ex.: 7º A - 2025)"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(e as any); }}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canCreate}
          className="rounded-xl bg-blue-600 px-5 py-2 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      <ul className="divide-y rounded-2xl border border-gray-200 bg-white">
        {list.length === 0 ? (
          <li className="p-4 text-sm text-gray-500">Nenhuma turma criada ainda.</li>
        ) : (
          list.map((t) => (
            <li key={t.id} className="p-0">
              <Link
                href={`/classes/${t.id}`}
                className="block px-4 py-3 text-sm hover:bg-gray-50"
                title="Abrir turma"
              >
                {t.name}
              </Link>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}

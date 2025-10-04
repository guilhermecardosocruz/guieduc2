'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ClassItem = {
  id: string;
  name: string;
  createdAt: string;
};

const LS_KEY = "guieduc:classes";

async function apiList(): Promise<ClassItem[]> {
  try {
    const res = await fetch("/api/classes", { cache: "no-store" });
    if (!res.ok) throw new Error("API list failed");
    return await res.json();
  } catch {
    // fallback localStorage
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  }
}

async function apiCreate(name: string): Promise<ClassItem> {
  const optimistic: ClassItem = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };

  // tenta API
  try {
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("API create failed");
    const created: ClassItem = await res.json();
    return created;
  } catch {
    // fallback localStorage
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
      // ordena por data desc
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setList(data);
    })();
    return () => { alive = false; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setBusy(true);

    const trimmed = name.trim();
    setName("");

    // Otimista: aparece embaixo sem sair da tela
    const temp: ClassItem = { id: "tmp-" + crypto.randomUUID(), name: trimmed, createdAt: new Date().toISOString() };
    setList(prev => [temp, ...prev]);

    try {
      const created = await apiCreate(trimmed);
      setList(prev =>
        prev.map(it => (it.id === temp.id ? created : it))
      );
    } catch {
      // mantém o otimista se falhar completamente
    } finally {
      setBusy(false);
    }
  }

  // persistência local quando lista mudar (para fallback offline)
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
  }, [list]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Criar Turma</h1>
        <p className="text-sm text-gray-600">
          Preencha o nome e adicione. A turma aparece na lista abaixo imediatamente e é clicável.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mb-8 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da turma (ex.: 7º A - 2025)"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!canCreate}
          className="rounded-xl bg-blue-600 px-5 py-2 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Adicionando..." : "Adicionar"}
        </button>
      </form>

      <section className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma turma criada ainda.</p>
        ) : (
          list.map((t) => (
            <article
              key={t.id}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* Cartão clicável inteiro para a página da turma */}
              <Link
                href={`/classes/${t.id}`}
                className="block"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium">
                    {t.name}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Abrir turma</p>
              </Link>

              {/* Ações internas: Chamadas e Conteúdos */}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/classes/${t.id}/chamadas`}
                  className="rounded-xl border px-3 py-1 text-sm transition hover:border-blue-500 hover:text-blue-600"
                >
                  Chamadas
                </Link>
                <Link
                  href={`/classes/${t.id}/conteudos`}
                  className="rounded-xl border px-3 py-1 text-sm transition hover:border-blue-500 hover:text-blue-600"
                >
                  Conteúdos
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

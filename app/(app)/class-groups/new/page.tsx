"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Brand from "@/components/Brand";

export default function NewClassGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/class-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc })
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(j?.error || "Falha ao criar grupo");
      router.push("/home");
    } catch (e:any) {
      setErr(e.message || "Erro");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-dvh">
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Brand />
          <Link href="/home" className="text-sm underline">Voltar</Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Criar grupo de turmas</h1>
        <p className="text-gray-600 mb-6">Agrupe várias turmas sob um mesmo grupo.</p>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm mb-1">Nome do grupo</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} required placeholder="Ex.: Fundamental II - Vespertino" />
          </div>
          <div>
            <label className="block text-sm mb-1">Descrição (opcional)</label>
            <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ex.: Agrupa 6º, 7º e 8º anos" />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar grupo"}
          </button>
        </form>
      </main>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Brand from "@/components/Brand";

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(j?.error || "Falha ao criar turma");
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
        <h1 className="text-2xl font-bold mb-2">Criar turma</h1>
        <p className="text-gray-600 mb-6">Preencha os dados da turma.</p>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm mb-1">Nome da turma</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} required placeholder="Ex.: 6º Ano A" />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar turma"}
          </button>
        </form>
      </main>
    </div>
  );
}

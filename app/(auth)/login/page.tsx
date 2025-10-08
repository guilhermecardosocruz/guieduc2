"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (res.ok) {
        try { router.replace("/dashboard"); } catch { location.assign("/dashboard"); }
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Falha ao entrar");
    } catch (err: any) {
      setError(err?.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="email"
               value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <input className="w-full border p-2 rounded" placeholder="senha"
               value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full border p-2 rounded">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

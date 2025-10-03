"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import Brand from "@/components/Brand";
import { APP_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Credenciais inválidas");
      const back = params.get("from") || "/dashboard";
      router.push(back);
    } catch (e:any) {
      setErr(e.message || "Erro ao entrar");
    } finally { setLoading(false); }
  }

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <Brand />
        <Link href="/register" className="text-sm underline">Criar conta</Link>
      </div>
      <h2 className="form-title">Entrar</h2>
      <p className="form-subtitle">Acesse sua conta {APP_NAME}</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input className="input" type="email" required value={email}
                 onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" />
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input className="input" type="password" required value={password}
                 onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/recover" className="text-sm underline">Esqueci minha senha</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="card"><p className="form-subtitle">Carregando…</p></div>}>
        <LoginInner />
      </Suspense>
    </AuthLayout>
  );
}

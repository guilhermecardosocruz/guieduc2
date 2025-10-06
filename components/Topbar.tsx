'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Brand from "./Brand";
import LogoutButton from "./LogoutButton";

const DEPTH_KEY = "guieduc:navigateDepth";
const LAST_KEY  = "guieduc:lastPath";

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [depth, setDepth] = useState<number>(1);

  // Atualiza profundidade de navegação por sessão (sessionStorage)
  useEffect(() => {
    if (!pathname) return;
    try {
      const ss = sessionStorage;
      const last = ss.getItem(LAST_KEY);
      let d = parseInt(ss.getItem(DEPTH_KEY) || "1", 10);
      if (!last) {
        ss.setItem(LAST_KEY, pathname);
        ss.setItem(DEPTH_KEY, String(d));
        setDepth(d);
        return;
      }
      if (last !== pathname) {
        // Nova rota “avança” profundidade
        d = isNaN(d) ? 1 : d + 1;
        ss.setItem(DEPTH_KEY, String(d));
        ss.setItem(LAST_KEY, pathname);
        setDepth(d);
      } else {
        // mesma rota, mantém
        setDepth(isNaN(d) ? 1 : d);
      }
    } catch {
      // sem sessionStorage (SSR ou privacy), mantém 1
      setDepth(1);
    }
  }, [pathname]);

  async function handleBack() {
    try {
      const ss = sessionStorage;
      const raw = ss.getItem(DEPTH_KEY);
      const current = Math.max(parseInt(raw || "1", 10) || 1, 1);

      if (current > 1) {
        // volta uma página e decrementa
        ss.setItem(DEPTH_KEY, String(current - 1));
        router.back();
        return;
      }

      // já estamos na “primeira” — confirma saída
      if (confirm("Deseja sair do app?")) {
        try {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        } finally {
          // limpa marcadores e vai pro login
          try { ss.removeItem(DEPTH_KEY); ss.removeItem(LAST_KEY); } catch {}
          router.push("/login");
        }
      }
    } catch {
      // fallback absoluto
      router.push("/login");
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        {/* Esquerda: Voltar */}
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          title="Voltar"
        >
          Voltar
        </button>

        {/* Centro: Marca / link dashboard */}
        <Link href="/dashboard" className="text-sm font-semibold hover:opacity-80">
          <Brand />
        </Link>

        {/* Direita: Sair manual (opcional, se quiser manter) */}
        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

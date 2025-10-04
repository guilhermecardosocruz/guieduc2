'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // ignora erro, seguimos para a tela de login
    } finally {
      // vai para login e força refresh para limpar cache/headers
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={busy}
      className="rounded-lg border px-3 py-1 text-sm transition hover:border-red-500 hover:text-red-600 disabled:opacity-60"
      title="Encerrar sessão"
    >
      {busy ? "Saindo..." : "Sair"}
    </button>
  );
}

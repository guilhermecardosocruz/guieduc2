"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NewCallPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onCreate() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/classes/${params.id}/chamadas`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "server_error");
      }
      // após criar, volta pra lista de chamadas da turma
      router.replace(`/classes/${params.id}/chamadas`);
    } catch (e: any) {
      setErr(e?.message || "Erro ao criar chamada");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Nova chamada</h1>
      <p className="text-sm text-gray-600 mb-6">
        Isso cria um registro de chamada para a turma atual. Você poderá marcar presenças depois.
      </p>

      <button
        disabled={loading}
        onClick={onCreate}
        className="rounded-xl px-5 py-3 bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Criando..." : "Criar chamada agora"}
      </button>

      {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}

      <div className="mt-6">
        <button
          onClick={() => router.back()}
          className="text-sm underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

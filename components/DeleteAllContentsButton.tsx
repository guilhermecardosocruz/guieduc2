'use client';
import React from "react";

export default function DeleteAllContentsButton({
  classId,
  onDeleted,
}: { classId: string; onDeleted?: () => void }) {
  async function handleClick() {
    if (!classId) return;
    const ok = confirm("Tem certeza que deseja excluir TODOS os conteúdos desta turma? Esta ação não pode ser desfeita.");
    if (!ok) return;
    // otimista: limpa local
    try {
      localStorage.setItem(`guieduc:class:${classId}:contents`, JSON.stringify([]));
    } catch {}

    try {
      const r = await fetch(`/api/classes/${classId}/conteudos`, { method: "DELETE" });
      if (r.status === 200 || r.status === 204) {
        onDeleted?.();
        return;
      }
      throw new Error(`status ${r.status}`);
    } catch (e) {
      alert("Falha ao excluir todos. Tentaremos restaurar a lista local.");
      // não temos snapshot aqui; a página pode recarregar do servidor/local
      window.location.reload();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      aria-label="Excluir todos os conteúdos"
      title="Excluir todos os conteúdos"
    >
      Excluir todos
    </button>
  );
}

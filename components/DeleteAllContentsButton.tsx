'use client';
export default function DeleteAllContentsButton({ classId, onDeleted }: { classId: string; onDeleted?: () => void }) {
  async function handle() {
    if (!classId) return;
    if (!confirm("Tem certeza que deseja excluir TODOS os conteúdos desta turma?")) return;
    try { localStorage.setItem(`guieduc:class:${classId}:contents`, JSON.stringify([])); } catch {}
    try {
      const r = await fetch(`/api/classes/${classId}/conteudos`, { method: "DELETE" });
      if (r.status === 200 || r.status === 204) { onDeleted?.(); return; }
      throw new Error(String(r.status));
    } catch {
      alert("Falha ao excluir todos. Restaurando…");
      location.reload();
    }
  }
  return (
    <button type="button" onClick={handle}
      className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
      Excluir todos
    </button>
  );
}

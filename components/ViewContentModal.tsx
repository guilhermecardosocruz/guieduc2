'use client';
import { useState } from "react";

export default function ViewContentModal({
  title,
  content,
  objectives,
  activities,
  resources,
  bncc,
}: {
  title?: string;
  content?: string;
  objectives?: string;
  activities?: string;
  resources?: string;
  bncc?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasExtras = !!(objectives || activities || resources || bncc);

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(()=> (document.getElementById('view-content-dialog') as HTMLDialogElement|undefined)?.showModal?.(), 0); }}
        className="rounded-2xl border px-3 py-2 text-sm hover:border-blue-500 hover:text-blue-600"
        title="Ver conteúdo da aula"
      >
        Conteúdo
      </button>

      <dialog id="view-content-dialog" className="rounded-2xl p-0 backdrop:bg-black/30">
        {open && (
          <form method="dialog" className="w-[92vw] max-w-3xl rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Conteúdo da aula</h3>
              <button type="button" onClick={()=>{ setOpen(false); (document.getElementById('view-content-dialog') as HTMLDialogElement|undefined)?.close?.(); }} className="rounded-lg border px-3 py-1 text-sm">Fechar</button>
            </div>

            {title && (
              <>
                <div className="mb-1 text-xs font-medium text-gray-500">Título</div>
                <div className="mb-4 rounded-xl border bg-gray-50 px-3 py-2">{title}</div>
              </>
            )}

            {content && (
              <>
                <div className="mb-1 text-xs font-medium text-gray-500">Conteúdo da Aula</div>
                <div className="mb-4 whitespace-pre-wrap rounded-xl border bg-gray-50 px-3 py-2">{content}</div>
              </>
            )}

            {hasExtras && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {objectives && (
                  <div>
                    <div className="mb-1 text-xs font-medium text-gray-500">Objetivos</div>
                    <div className="whitespace-pre-wrap rounded-xl border bg-gray-50 px-3 py-2">{objectives}</div>
                  </div>
                )}
                {activities && (
                  <div>
                    <div className="mb-1 text-xs font-medium text-gray-500">Desenvolvimento das Atividades</div>
                    <div className="whitespace-pre-wrap rounded-xl border bg-gray-50 px-3 py-2">{activities}</div>
                  </div>
                )}
                {resources && (
                  <div>
                    <div className="mb-1 text-xs font-medium text-gray-500">Recursos Didáticos</div>
                    <div className="whitespace-pre-wrap rounded-xl border bg-gray-50 px-3 py-2">{resources}</div>
                  </div>
                )}
                {bncc && (
                  <div>
                    <div className="mb-1 text-xs font-medium text-gray-500">BNCC</div>
                    <div className="whitespace-pre-wrap rounded-xl border bg-gray-50 px-3 py-2">{bncc}</div>
                  </div>
                )}
              </div>
            )}

            {(!title && !content && !hasExtras) && (
              <div className="text-sm text-gray-500">Sem conteúdo registrado para esta aula.</div>
            )}
          </form>
        )}
      </dialog>
    </>
  );
}

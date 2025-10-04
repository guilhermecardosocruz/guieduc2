import Link from "next/link";

type CallRecord = {
  id: string;
  classId: string;
  title: string;
  createdAt: string;
};

function lsKeyCalls(classId: string) {
  return `guieduc:class:${classId}:calls`;
}

async function getCalls(classId: string): Promise<CallRecord[]> {
  if (!classId) return [];
  try {
    const raw = (await import("node:fs/promises"))
      .readFile; // só pra evitar erros em build; não usado no client
  } catch {}
  // roda no server: lemos do localStorage via "no-store"? Não. Então usamos fetch no client na criação/edição.
  // Aqui vamos renderizar estático mínimo e o restante client-side com hydration (link Nova chamada).
  return [];
}

export default async function CallsIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamadas</h1>
        <Link
          href={`/classes/${id}/chamadas/new`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nova chamada
        </Link>
      </header>

      {/* Lista client-side */}
      <CallsListClient classId={id} />
    </main>
  );
}

function CallsListClient({ classId }: { classId: string }) {
  // componente client inline sem "use client" (Next 15 permite dentro do server component)
  // para evitar arquivo extra
  return (
    <div suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  const root = document.currentScript.parentElement;
  const key = 'guieduc:class:${classId}:calls';
  let list = [];
  try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
  list.sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
  if(!list.length){
    root.innerHTML = '<p class="text-sm text-gray-500">Nenhuma chamada criada ainda.</p>';
    return;
  }
  const ul = document.createElement('ul');
  ul.className = 'divide-y rounded-2xl border border-gray-200 bg-white';
  list.forEach(function(c){
    const li = document.createElement('li');
    li.className='p-0';
    const a = document.createElement('a');
    a.className='block px-4 py-3 text-sm hover:bg-gray-50';
    a.href = '/classes/${classId}/chamadas/' + c.id;
    a.textContent = (c.title || 'Sem título') + ' — ' + new Date(c.createdAt).toLocaleString();
    li.appendChild(a);
    ul.appendChild(li);
  });
  root.replaceChildren(ul);
})();`,
        }}
      />
    </div>
  );
}

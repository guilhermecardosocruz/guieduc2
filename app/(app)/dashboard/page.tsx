import Link from "next/link";

export const metadata = { title: "Dashboard | GUIEDUC" };

export default function DashboardPage() {
  const actions = [
    { href: "/classes/new", title: "Criar Turma", desc: "Cadastre uma nova turma com nome e configurações básicas." },
    { href: "/class-groups/new", title: "Criar Grupo de Turmas", desc: "Agrupe várias turmas para organizar conteúdos e chamadas." },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Bem-vindo(a)</h1>
        <p className="text-sm text-gray-600">Escolha abaixo o que deseja criar.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium">{a.title}</h2>
              <span aria-hidden className="rounded-full border px-2 py-1 text-xs text-gray-600 transition group-hover:border-blue-500 group-hover:text-blue-600">
                abrir →
              </span>
            </div>
            <p className="text-sm text-gray-600">{a.desc}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

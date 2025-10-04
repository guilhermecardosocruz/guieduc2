import Link from "next/link";

async function getClass(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/classes/${id}`, {
      cache: "no-store",
      // em dev, NEXT_PUBLIC_BASE_URL pode estar vazio; o Next usa relative fetch no server
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cls = await getClass(id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          {cls?.name ?? "Turma"}
        </h1>
        <p className="text-sm text-gray-600">Escolha uma ação para esta turma.</p>
      </header>

      <div className="flex gap-3">
        <Link
          href={`/classes/${id}/chamadas`}
          className="rounded-xl border px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
        >
          Chamadas
        </Link>
        <Link
          href={`/classes/${id}/conteudos`}
          className="rounded-xl border px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-600"
        >
          Conteúdos
        </Link>
      </div>
    </main>
  );
}

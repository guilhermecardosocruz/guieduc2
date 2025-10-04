"use client";
import Link from "next/link";
import Brand from "@/components/Brand";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Brand />
          <nav className="text-sm text-gray-600">
            <Link href="/dashboard" className="underline">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo(a)</h1>
          <p className="text-gray-600 mb-8">Escolha uma das ações abaixo para começar.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/classes/new" className="rounded-3xl border border-gray-100 p-6 bg-white hover:shadow-sm transition">
              <h2 className="text-xl font-semibold mb-1">Criar turma</h2>
              <p className="text-gray-500 text-sm">Cadastre uma turma única.</p>
            </Link>

            <Link href="/class-groups/new" className="rounded-3xl border border-gray-100 p-6 bg-white hover:shadow-sm transition">
              <h2 className="text-xl font-semibold mb-1">Criar grupo de turmas</h2>
              <p className="text-gray-500 text-sm">Agrupe várias turmas sob um mesmo grupo.</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

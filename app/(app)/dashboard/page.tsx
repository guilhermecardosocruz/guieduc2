"use client";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";

export default function DashboardPage() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="w-full border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Brand />
          <button onClick={logout} className="btn-primary">Sair</button>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Acesso protegido por JWT em cookie HttpOnly.</p>
        </div>
      </main>
    </div>
  );
}

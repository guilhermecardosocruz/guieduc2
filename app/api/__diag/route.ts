import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function maskDbUrl(url?: string) {
  if (!url) return "N/A";
  try {
    const u = new URL(url);
    // mascara usuário/senha e query
    const host = u.host;
    return `${u.protocol}//***:***@${host}${u.pathname}`;
  } catch {
    return "INVALID_URL";
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const provider =
    dbUrl?.includes("neon.tech") || dbUrl?.startsWith("postgres")
      ? "postgres (provável Neon)"
      : (dbUrl?.endsWith(".db") ? "sqlite (arquivo local)" : "desconhecido");

  return new NextResponse(
    JSON.stringify({
      ok: true,
      database_url: maskDbUrl(dbUrl),
      provider,
      tips: provider.startsWith("sqlite")
        ? "Parece SQLite local. Se quiser sincronizar entre dispositivos, aponte DATABASE_URL para o Neon Postgres."
        : "Parece Postgres. Se ainda não sincroniza, veja cache de API/Service Worker.",
    }, null, 2),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    }
  );
}

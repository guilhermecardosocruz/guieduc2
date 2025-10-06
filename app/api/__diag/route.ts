import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
function mask(url?: string) {
  if (!url) return 'N/A';
  try { const u = new URL(url); return `${u.protocol}//***:***@${u.host}${u.pathname}`; } catch { return 'INVALID_URL'; }
}
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const provider = dbUrl?.includes('neon.tech') || dbUrl?.startsWith('postgres') ? 'postgres (provável Neon)' : 'desconhecido';
  return new NextResponse(JSON.stringify({ ok:true, provider, database_url: mask(dbUrl) }, null, 2), {
    headers: { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' }
  });
}

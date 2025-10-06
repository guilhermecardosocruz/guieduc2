import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'; export const revalidate = 0;
export async function GET() {
  const ping = await prisma.$queryRawUnsafe('select 1 as ok');
  return NextResponse.json({ ok: true, ping }, { headers: { 'cache-control':'no-store' } });
}

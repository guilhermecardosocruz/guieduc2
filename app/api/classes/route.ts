import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const rows = await prisma.class.findMany({ orderBy: { createdAt: 'desc' } });
  return new NextResponse(JSON.stringify(rows), { headers: { 'cache-control':'no-store', 'content-type':'application/json' } });
}
export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.class.create({ data });
  return new NextResponse(JSON.stringify(created), { status:201, headers: { 'cache-control':'no-store', 'content-type':'application/json' } });
}

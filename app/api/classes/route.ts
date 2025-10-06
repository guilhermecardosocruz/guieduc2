import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
  });
  return new NextResponse(JSON.stringify(data), {
    headers: { "cache-control": "no-store", "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.class.create({ data: body });
  return new NextResponse(JSON.stringify(created), {
    status: 201,
    headers: { "cache-control": "no-store", "content-type": "application/json" },
  });
}

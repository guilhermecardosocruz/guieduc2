import { NextResponse } from "next/server";

let mem: { id: string; name: string; createdAt: string }[] = [];

export async function GET() {
  return NextResponse.json(mem, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = { id: crypto.randomUUID(), name: String(body.name || "").trim(), createdAt: new Date().toISOString() };
    if (!item.name) return NextResponse.json({ error: "name required" }, { status: 400 });
    mem = [item, ...mem];
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

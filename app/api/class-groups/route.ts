import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, description } = await req.json().catch(()=>({}));
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  const id = crypto.randomUUID();
  return NextResponse.json({ ok: true, id, name, description: description || "" }, { status: 201 });
}

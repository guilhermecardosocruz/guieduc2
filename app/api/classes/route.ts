import { NextResponse } from "next/server";

export async function GET() {
  const now = Date.now();
  const data = [
    { id: "1", name: "Turma A", updatedAt: now },
    { id: "2", name: "Turma B", updatedAt: now }
  ];
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const { name } = await req.json().catch(()=>({}));
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  const id = crypto.randomUUID();
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

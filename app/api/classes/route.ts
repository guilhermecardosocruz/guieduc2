import { NextResponse } from "next/server";
export async function GET() {
  const now = Date.now();
  const data = [
    { id: "1", name: "Turma A", updatedAt: now },
    { id: "2", name: "Turma B", updatedAt: now }
  ];
  return NextResponse.json(data, { status: 200 });
}

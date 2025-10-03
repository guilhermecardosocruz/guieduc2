import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({} as any));
  if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 });

  // Sem envio real de e-mail neste demo.
  return NextResponse.json({ ok: true, message: 'Se existir uma conta, enviaremos instruções.' }, { status: 200 });
}

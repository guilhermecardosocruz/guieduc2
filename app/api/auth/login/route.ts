import { NextResponse } from 'next/server';
import { signSession, authCookieName } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({} as any));
  const demoEmail = process.env.DEMO_EMAIL;
  const demoPass = process.env.DEMO_PASSWORD;

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
  }

  // 🔐 Validação mínima: somente usuário demo (até conectar banco/NextAuth)
  const ok = email === demoEmail && password === demoPass;
  if (!ok) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const token = await signSession({ sub: email });
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(authCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

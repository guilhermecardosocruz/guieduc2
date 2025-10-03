import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/crypto';
import { signSession, authCookieName } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parse = LoginSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  const email = parse.data.email.trim().toLowerCase();
  const password = parse.data.password;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });

  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(authCookieName(), token, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

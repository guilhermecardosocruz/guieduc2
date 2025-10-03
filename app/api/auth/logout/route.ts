import { NextResponse } from 'next/server';
import { authCookieName } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(authCookieName(), '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

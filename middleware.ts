import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'guieduc_session';
const AUTH_ROUTES = ['/login', '/register', '/recover'];

function getSecret() {
  const s = process.env.AUTH_SECRET;
  return new TextEncoder().encode(s || 'dev-secret');
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;

  // tenta validar token (se existir)
  let authenticated = false;
  if (token) {
    try { await jwtVerify(token, getSecret()); authenticated = true; } catch {}
  }

  // se logado, não deixar voltar para telas de auth
  if (authenticated && AUTH_ROUTES.includes(pathname)) {
    const url = req.nextUrl.clone(); url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // se não logado e tentando acessar área protegida
  const needsAuth =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/(app)');

  if (!authenticated && needsAuth) {
    const url = req.nextUrl.clone(); url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/recover',
    '/dashboard',
    '/(app)/(.*)',
  ]
};

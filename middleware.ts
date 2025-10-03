import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, authCookieName } from './lib/auth';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Liberar rotas públicas e assets
  const publicPaths = ['/', '/login', '/register', '/recover', '/offline', '/manifest.json', '/sw.js'];
  if (publicPaths.includes(pathname) || pathname.startsWith('/icons/') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Proteger tudo sob /dashboard (e outras futuras rotas de app)
  if (pathname.startsWith('/dashboard')) {
    const cookie = req.cookies.get(authCookieName());
    if (!cookie?.value) {
      const url = new URL('/login', req.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    try {
      await verifySession(cookie.value);
      return NextResponse.next();
    } catch {
      const url = new URL('/login', req.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    // adicione aqui mais rotas protegidas no futuro
  ]
};

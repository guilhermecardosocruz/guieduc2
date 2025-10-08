import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ⚠️ Nunca interceptar API, estáticos e arquivos do PWA
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/offline"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/recover";

  // Se não logado e não está em rota pública → manda pro login
  if (!token && !isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Se já logado e tentando ir pra /login|/register|/recover → manda pro /dashboard
  if (token && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Matcher: aplica o middleware em "tudo", exceto o que filtramos dentro da função
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

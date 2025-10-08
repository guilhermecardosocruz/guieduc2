import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC = ["/login", "/register", "/recover", "/offline", "/api/auth/login", "/api/auth/register", "/manifest.json", "/sw.js", "/icons", "/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p))) return NextResponse.next();

  const has = req.cookies.get("token")?.value;
  if (!has) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/|icons/|api/health).*)"] };

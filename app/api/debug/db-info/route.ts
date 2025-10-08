import { NextResponse } from "next/server";

export async function GET() {
  try {
    const raw = process.env.DATABASE_URL || "";
    const u = new URL(raw);
    return NextResponse.json({
      ok: true,
      host: u.host,
      db: u.pathname,
      ssl: u.search.includes("sslmode=require") ? "require" : "unknown"
    });
  } catch {
    return NextResponse.json({ ok:false }, { status: 500 });
  }
}

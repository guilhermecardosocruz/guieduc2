import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authCookieName, verifySession } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(authCookieName())?.value;
  if (!token) return NextResponse.json({ ok:false }, { status: 401 });
  try {
    const session = await verifySession(token);
    return NextResponse.json({ ok:true, user: session }, { status: 200 });
  } catch {
    return NextResponse.json({ ok:false }, { status: 401 });
  }
}

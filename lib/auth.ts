import { SignJWT, jwtVerify } from 'jose';

const COOKIE = 'guieduc_session';
export function authCookieName(){ return COOKIE; }

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET ausente');
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; email: string; name: string };

export async function signSession(payload: SessionPayload, exp: string = '30d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(exp)      // sessão dura 30 dias
    .sign(getSecret());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as SessionPayload;
}

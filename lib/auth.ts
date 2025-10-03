import { SignJWT, jwtVerify } from 'jose';

const alg = 'HS256';
const cookieName = 'auth';

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET não definido');
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: Record<string, unknown>, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAgeSeconds)
    .sign(secret);
}

export async function verifySession(token: string) {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export function authCookieName() {
  return cookieName;
}

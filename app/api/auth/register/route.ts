import { NextResponse } from 'next/server';

// Como ainda não temos banco, bloqueamos "criação" real.
// Você pode redirecionar o usuário para falar com o admin, ou apenas informar o demo.
export async function POST(req: Request) {
  return NextResponse.json({
    error: 'Registro desabilitado neste demo. Use DEMO_EMAIL/DEMO_PASSWORD no .env.local.'
  }, { status: 403 });
}

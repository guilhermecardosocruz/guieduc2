import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parse = RegisterSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  const name = parse.data.name.trim();
  const email = parse.data.email.trim().toLowerCase();
  const password = parse.data.password;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { name, email, passwordHash } });

  return NextResponse.json({ ok: true }, { status: 201 });
}

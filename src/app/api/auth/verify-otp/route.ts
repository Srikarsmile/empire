import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { email, code } = await request.json();

  const normalizedEmail = String(email).toLowerCase().trim();

  const record = await prisma.otpCode.findFirst({
    where: {
      email: normalizedEmail,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record || record.code !== String(code)) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // One-time use — delete after successful verification
  await prisma.otpCode.delete({ where: { id: record.id } });

  const response = NextResponse.json({ ok: true });
  response.cookies.set('empire_auth', '1', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}

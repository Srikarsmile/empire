import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { phone, code } = await request.json();

  const digits = String(phone).replace(/\D/g, '');

  const record = await prisma.otpCode.findFirst({
    where: {
      phone: digits,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record || record.code !== String(code)) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // One-time use — delete after successful verification
  await prisma.otpCode.delete({ where: { id: record.id } });

  return NextResponse.json({ ok: true });
}

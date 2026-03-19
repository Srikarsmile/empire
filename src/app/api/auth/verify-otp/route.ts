import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

function hashOtp(code: string) {
  return createHash('sha256').update(code).digest('hex');
}

export async function POST(request: Request) {
  const { email, code } = await request.json();

  const normalizedEmail = String(email).toLowerCase().trim();

  const record = await prisma.otpCode.findFirst({
    where: {
      email: normalizedEmail,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // Brute-force protection: allow at most 5 attempts per code
  if (record.attempts >= 5) {
    await prisma.otpCode.delete({ where: { id: record.id } });
    return NextResponse.json(
      { error: 'Too many failed attempts. Please request a new code.' },
      { status: 429 },
    );
  }

  if (record.code !== hashOtp(String(code))) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // One-time use — delete after successful verification
  await prisma.otpCode.delete({ where: { id: record.id } });

  const adminEmails = String(process.env.ADMIN_EMAIL ?? '').toLowerCase().split(',').map(e => e.trim());
  const role = adminEmails.includes(normalizedEmail) ? 'admin' : 'customer';

  const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

  const response = NextResponse.json({ ok: true });
  response.cookies.set('empire_auth', '1', cookieOptions);
  response.cookies.set('empire_role', role, cookieOptions);
  response.cookies.set('empire_email', normalizedEmail, cookieOptions);
  return response;
}

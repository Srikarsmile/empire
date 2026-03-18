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
  return response;
}

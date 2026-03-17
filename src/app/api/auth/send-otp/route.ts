import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { phone } = await request.json();

  // Strip non-digits and compare against admin phone
  const digits = String(phone).replace(/\D/g, '');
  const adminPhone = String(process.env.ADMIN_PHONE ?? '').replace(/\D/g, '');

  if (!digits || digits !== adminPhone) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any previous OTP for this phone
  await prisma.otpCode.deleteMany({ where: { phone: digits } });

  // Save new OTP
  await prisma.otpCode.create({ data: { phone: digits, code, expiresAt } });

  // Send email via Resend
  await resend.emails.send({
    from: 'Empire Cars <onboarding@resend.dev>',
    to: process.env.ADMIN_EMAIL!,
    subject: 'Your Empire Cars login code',
    text: `Your login code is: ${code}\n\nThis code expires in 5 minutes.`,
  });

  return NextResponse.json({ ok: true });
}

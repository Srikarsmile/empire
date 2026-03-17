import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await request.json();

  const normalizedEmail = String(email).toLowerCase().trim();
  const adminEmails = String(process.env.ADMIN_EMAIL ?? '').toLowerCase().split(',').map(e => e.trim());

  if (!normalizedEmail || !adminEmails.includes(normalizedEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any previous OTP for this email
  await prisma.otpCode.deleteMany({ where: { email: normalizedEmail } });

  // Save new OTP
  await prisma.otpCode.create({ data: { email: normalizedEmail, code, expiresAt } });

  // Send email via Resend
  await resend.emails.send({
    from: 'Empire Cars <onboarding@resend.dev>',
    to: normalizedEmail,
    subject: 'Your Empire Cars login code',
    text: `Your login code is: ${code}\n\nThis code expires in 5 minutes.`,
  });

  return NextResponse.json({ ok: true });
}

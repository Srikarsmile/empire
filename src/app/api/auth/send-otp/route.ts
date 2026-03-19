import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { buildOtpEmail } from '@/lib/emailTemplates';

function hashOtp(code: string) {
  return createHash('sha256').update(code).digest('hex');
}

const OTP_RATE_LIMIT = 3; // max OTP requests per email
const OTP_RATE_WINDOW_MS = 10 * 60 * 1000; // 10-minute window
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const normalizedEmail = String(body.email ?? '').toLowerCase().trim();

  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Rate limit: count recent OTP requests for this email
  const recentCount = await prisma.otpCode.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: new Date(Date.now() - OTP_RATE_WINDOW_MS) },
    },
  });

  if (recentCount >= OTP_RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Too many code requests. Please wait a few minutes and try again.' },
      { status: 429 }
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any expired OTP for this email (keep recent ones for rate limit counting)
  await prisma.otpCode.deleteMany({
    where: {
      email: normalizedEmail,
      expiresAt: { lt: new Date() },
    },
  });

  // Save new OTP (store SHA-256 hash, never plaintext)
  await prisma.otpCode.create({ data: { email: normalizedEmail, code: hashOtp(code), expiresAt } });

  // Send branded OTP email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empirerentcar.com';
  const { subject, html } = buildOtpEmail({ code, appUrl, expiresInMinutes: 5 });

  await resend.emails.send({
    from: 'Empire Cars <noreply@empirerentcar.com>',
    to: normalizedEmail,
    subject,
    html,
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local[0]}***@${domain}`;
}

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const adminEmails = String(process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  const adminEmailDisplay =
    adminEmails.length === 0
      ? '(not set)'
      : `${redactEmail(adminEmails[0])}${adminEmails.length > 1 ? ` +${adminEmails.length - 1} more` : ''}`;

  const sc = await prisma.siteContent.findFirst();
  const scData = (sc?.data as Record<string, unknown>) ?? {};
  const companyPhone = (scData.companyPhone as string) ?? process.env.ADMIN_PHONE ?? '';

  return NextResponse.json({
    adminEmail: adminEmailDisplay,
    env: process.env.NODE_ENV ?? 'unknown',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    companyPhone,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { companyPhone } = await request.json();
  const sc = await prisma.siteContent.findFirst();
  const existing = sc ? ((sc.data as Record<string, unknown>) ?? {}) : {};

  await prisma.siteContent.upsert({
    where: { id: 'main' },
    create: { id: 'main', data: { ...existing, companyPhone } },
    update: { data: { ...existing, companyPhone } },
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    adminEmail: process.env.ADMIN_EMAIL ?? '(not set)',
    env: process.env.NODE_ENV ?? 'unknown',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  });
}

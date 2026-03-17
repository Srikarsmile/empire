import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email: string };
    const normalizedEmail = String(email).toLowerCase().trim();
    const adminEmails = String(process.env.ADMIN_EMAIL ?? '').toLowerCase().split(',').map(e => e.trim());

    const isAdmin = adminEmails.length > 0 && adminEmails.includes(normalizedEmail);

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 400 });
  }
}

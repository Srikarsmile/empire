import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email: string };
    const normalizedEmail = String(email).toLowerCase().trim();
    const adminEmail = String(process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();

    const isAdmin = adminEmail !== '' && normalizedEmail === adminEmail;

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 400 });
  }
}

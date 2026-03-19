import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Require authentication — only authenticated users can check admin status
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('empire_auth')?.value;
    if (!authCookie || authCookie !== '1') {
      return NextResponse.json({ isAdmin: false });
    }

    const { email } = (await request.json()) as { email: string };
    const normalizedEmail = String(email).toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    const adminEmails = String(process.env.ADMIN_EMAIL ?? '')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const isAdmin = adminEmails.length > 0 && adminEmails.includes(normalizedEmail);

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 400 });
  }
}

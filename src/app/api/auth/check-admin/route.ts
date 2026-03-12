import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone } = (await request.json()) as { phone: string };
    const cleanPhone = phone.replace(/\D/g, '');
    const adminPhone = process.env.ADMIN_PHONE || '';

    const isAdmin = adminPhone !== '' && (cleanPhone === adminPhone || cleanPhone.endsWith(adminPhone.slice(-10)));

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 400 });
  }
}

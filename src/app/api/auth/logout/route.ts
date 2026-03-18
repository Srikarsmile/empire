import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('empire_auth', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('empire_role', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}

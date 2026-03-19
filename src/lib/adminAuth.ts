import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Validates that the current request is from an authenticated admin.
 * Instead of trusting the `empire_role` cookie directly, we verify
 * the `empire_email` cookie against the ADMIN_EMAIL env variable.
 *
 * Returns the admin email if valid, or a 401/403 NextResponse if not.
 */
export async function requireAdmin(): Promise<
  { email: string } | NextResponse
> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('empire_auth')?.value;
  const emailCookie = cookieStore.get('empire_email')?.value;

  if (!authCookie || authCookie !== '1' || !emailCookie) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const normalizedEmail = emailCookie.toLowerCase().trim();
  const adminEmails = String(process.env.ADMIN_EMAIL ?? '')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  if (!adminEmails.includes(normalizedEmail)) {
    return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }

  return { email: normalizedEmail };
}

/**
 * Use in API route handlers: if result is a NextResponse, return it immediately.
 */
export function isAuthError(result: { email: string } | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

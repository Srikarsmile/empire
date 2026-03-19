import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isAdminRequest(request: NextRequest): boolean {
  const authCookie = request.cookies.get('empire_auth')?.value;
  const emailCookie = request.cookies.get('empire_email')?.value;

  if (!authCookie || authCookie !== '1' || !emailCookie) return false;

  const normalizedEmail = emailCookie.toLowerCase().trim();
  const adminEmails = String(process.env.ADMIN_EMAIL ?? '')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(normalizedEmail);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const admin = isAdminRequest(request);

  // Redirect unauthenticated visitors away from admin pages
  if (pathname.startsWith('/admin') && !admin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin API routes (airports + fees-config GET are public — used by booking flow)
  if (pathname.startsWith('/api/admin')) {
    const isPublicGet =
      request.method === 'GET' &&
      (pathname === '/api/admin/airports' || pathname === '/api/admin/fees-config');

    if (!isPublicGet && !admin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  }

  // Security headers on all responses
  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com",
      "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com",
      "frame-src https://js.stripe.com",
    ].join('; '),
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|icon.png|uploads/).*)',
  ],
};

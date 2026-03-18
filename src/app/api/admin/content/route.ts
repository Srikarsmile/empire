import { NextResponse } from 'next/server';
import { getSiteContent, setSiteContent } from '@/lib/siteContent';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const data = await request.json();
  await setSiteContent(data);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { getSiteContent, setSiteContent } from '@/lib/siteContent';

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const data = await request.json();
  await setSiteContent(data);
  return NextResponse.json({ ok: true });
}

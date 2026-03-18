import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export type FeesConfig = {
  taxRate: number;
  taxEnabled: boolean;
  airportEnabled: boolean;
  insuranceEnabled: boolean;
  insuranceFee: number;
};

export async function getFeesConfig(): Promise<FeesConfig> {
  const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  const data = (content?.data ?? {}) as Record<string, unknown>;
  return {
    taxRate: typeof data.taxRate === 'number' ? data.taxRate : 14,
    taxEnabled: data.taxEnabled !== false,
    airportEnabled: data.airportEnabled !== false,
    insuranceEnabled: data.insuranceEnabled === true,
    insuranceFee: typeof data.insuranceFee === 'number' ? data.insuranceFee : 0,
  };
}

export async function GET() {
  const config = await getFeesConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<FeesConfig>;
    const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
    const data = (content?.data ?? {}) as Record<string, unknown>;
    const updated = { ...data, ...body };
    await prisma.siteContent.upsert({
      where: { id: 'main' },
      create: { id: 'main', data: updated },
      update: { data: updated },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Fees config save error:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

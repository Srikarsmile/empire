import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getTaxRate(): Promise<number> {
  const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  const data = (content?.data ?? {}) as Record<string, unknown>;
  return typeof data.taxRate === 'number' ? data.taxRate : 14;
}

export async function GET() {
  const taxRate = await getTaxRate();
  return NextResponse.json({ taxRate });
}

export async function POST(request: Request) {
  try {
    const { taxRate } = (await request.json()) as { taxRate: number };
    const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
    const data = (content?.data ?? {}) as Record<string, unknown>;
    await prisma.siteContent.upsert({
      where: { id: 'main' },
      create: { id: 'main', data: { ...data, taxRate: Number(taxRate) } },
      update: { data: { ...data, taxRate: Number(taxRate) } },
    });
    return NextResponse.json({ taxRate: Number(taxRate) });
  } catch (err) {
    console.error('Tax rate save error:', err);
    return NextResponse.json({ error: 'Failed to save tax rate' }, { status: 500 });
  }
}

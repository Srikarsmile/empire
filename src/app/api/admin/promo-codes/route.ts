import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(codes);
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const body = (await request.json()) as {
    code: string;
    type: string;
    value: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  };

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }
  if (!['percentage', 'fixed'].includes(body.type)) {
    return NextResponse.json({ error: 'Type must be percentage or fixed' }, { status: 400 });
  }
  if (typeof body.value !== 'number' || body.value <= 0) {
    return NextResponse.json({ error: 'Value must be a positive number' }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: body.code.trim().toUpperCase(),
        type: body.type,
        value: body.value,
        maxUses: body.maxUses ?? null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
  }
}

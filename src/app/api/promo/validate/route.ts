import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = (await request.json()) as { code: string; subtotal: number };

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: body.code.trim().toUpperCase() },
  });

  if (!promo || !promo.active) {
    return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 404 });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Promo code has expired' }, { status: 410 });
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 410 });
  }

  const subtotal = Number(body.subtotal) || 0;
  const discount =
    promo.type === 'percentage'
      ? Math.round(subtotal * (promo.value / 100))
      : promo.value;

  return NextResponse.json({
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount: Math.min(discount, subtotal),
  });
}

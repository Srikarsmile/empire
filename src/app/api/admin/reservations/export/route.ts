import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { vehicleTitle: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'Vehicle', 'Check-in', 'Check-out', 'Nights',
    'Price/day', 'Subtotal', 'Taxes', 'Airport Fee', 'Insurance Fee',
    'Promo Code', 'Promo Discount', 'Total', 'Status', 'Booked At',
  ];

  function esc(value: string | number) {
    const str = String(value ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }

  const rows = reservations.map((r) => [
    r.id,
    r.firstName,
    r.lastName,
    r.email,
    r.phone,
    r.vehicleTitle,
    r.checkIn,
    r.checkOut,
    r.nights,
    r.price,
    r.subtotal,
    r.taxes,
    r.airportFee,
    r.insuranceFee,
    r.promoCode,
    r.promoDiscount,
    r.total,
    r.status,
    new Date(r.createdAt).toISOString(),
  ].map(esc).join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

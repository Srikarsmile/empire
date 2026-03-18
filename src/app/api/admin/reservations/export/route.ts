import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAdmin();
  if (authError instanceof NextResponse) return authError;
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'Vehicle', 'Check-in', 'Check-out', 'Nights',
    'Price/day', 'Subtotal', 'Taxes', 'Total', 'Status', 'Booked At',
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

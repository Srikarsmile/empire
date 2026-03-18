import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export type Airport = {
  id: string;
  name: string;
  city: string;
  fee: number;
};

async function getAirports(): Promise<Airport[]> {
  const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  const data = (content?.data ?? {}) as Record<string, unknown>;
  return (data.airports as Airport[]) ?? [];
}

async function saveAirports(airports: Airport[]) {
  const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
  const data = (content?.data ?? {}) as Record<string, unknown>;
  await prisma.siteContent.upsert({
    where: { id: 'main' },
    create: { id: 'main', data: { ...data, airports } },
    update: { data: { ...data, airports } },
  });
}

export async function GET() {
  const airports = await getAirports();
  return NextResponse.json(airports);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; name: string; city: string; fee: number };
    const airports = await getAirports();
    const id = body.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const existing = airports.findIndex((a) => a.id === id);
    const airport: Airport = { id, name: body.name, city: body.city, fee: Number(body.fee) };

    if (existing >= 0) {
      airports[existing] = airport;
    } else {
      airports.push(airport);
    }

    await saveAirports(airports);
    return NextResponse.json(airport);
  } catch (err) {
    console.error('Airport save error:', err);
    return NextResponse.json({ error: 'Failed to save airport' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id: string };
    const airports = await getAirports();
    await saveAirports(airports.filter((a) => a.id !== id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Airport delete error:', err);
    return NextResponse.json({ error: 'Failed to delete airport' }, { status: 500 });
  }
}

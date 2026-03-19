import { prisma } from './prisma';

export type ReservationRecord = {
  id: string;
  status: string;
  createdAt: Date;
  stripeSessionId?: string | null;
  vehicleId: string;
  vehicleTitle: string;
  vehicleImage: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  price: number;
  subtotal: number;
  taxes: number;
  total: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  airportFee: number;
  dropoffLocation: string;
  insuranceFee: number;
};

export async function getAllReservations(): Promise<ReservationRecord[]> {
  const rows = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
  return rows as unknown as ReservationRecord[];
}

export async function findBySessionId(sessionId: string): Promise<ReservationRecord | null> {
  const row = await prisma.reservation.findUnique({ where: { stripeSessionId: sessionId } });
  return row as unknown as ReservationRecord | null;
}

export async function addReservation(
  data: Omit<ReservationRecord, 'id' | 'status' | 'createdAt'>
): Promise<ReservationRecord> {
  const row = await prisma.reservation.create({
    data: {
      ...data,
      stripeSessionId: data.stripeSessionId ?? null,
    },
  });
  return row as unknown as ReservationRecord;
}

import ReservationFlow from '@/components/ReservationFlow';

export default async function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ReservationFlow vehicleId={resolvedParams.id} />;
}

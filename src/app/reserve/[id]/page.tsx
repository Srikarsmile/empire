import ReservationFlow from '@/components/ReservationFlow';
import { getSiteContent } from '@/lib/siteContent';

export default async function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, siteContent] = await Promise.all([params, getSiteContent()]);
  return (
    <ReservationFlow
      vehicleId={resolvedParams.id}
      cancellationPolicy={siteContent.cancellationPolicy}
    />
  );
}

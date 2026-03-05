import BookingFlow from '@/components/BookingFlow';

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <BookingFlow propertyId={resolvedParams.id} />;
}

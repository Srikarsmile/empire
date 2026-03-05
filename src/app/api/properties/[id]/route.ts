import { NextResponse } from 'next/server';
import { getPropertyById } from '@/lib/propertyData';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const property = getPropertyById(id);

    if (property) {
        return NextResponse.json(property);
    }

    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
}

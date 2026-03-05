import { NextResponse } from 'next/server';
import { getAllProperties } from '@/lib/propertyData';

export async function GET() {
    return NextResponse.json(getAllProperties());
}

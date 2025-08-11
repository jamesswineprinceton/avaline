import { NextResponse } from 'next/server';
import { fetchPriceRows } from '@/lib/sheets';
import { calculatePriceMetrics } from '@/lib/avaline';

export async function GET() {
  try {
    const priceRows = await fetchPriceRows();
    const metrics = calculatePriceMetrics(priceRows);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in /api/prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
} 
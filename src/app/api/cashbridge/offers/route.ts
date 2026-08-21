import { NextResponse } from 'next/server';
import { getOffers } from '../../../../lib/dataLink';

export async function GET() {
  try {
    const allOffers = await getOffers();
    // Filter to only ACTIVE offers as specified
    const activeOffers = allOffers.filter((o: any) => o.status === 'ACTIVE');
    return NextResponse.json(activeOffers);
  } catch (error: any) {
    console.error('Error fetching cashbridge offers:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

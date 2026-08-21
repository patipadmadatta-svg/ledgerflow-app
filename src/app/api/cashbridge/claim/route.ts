import { NextResponse } from 'next/server';
import { claimOffer } from '../../../../lib/dataLink';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offer_id, claimed_by } = body;

    if (!offer_id || !claimed_by) {
      return NextResponse.json(
        { error: 'offer_id and claimed_by are required fields' },
        { status: 400 }
      );
    }

    const updatedOffer = await claimOffer(offer_id, claimed_by);

    if (!updatedOffer) {
      return NextResponse.json({ error: 'Active financing offer not found' }, { status: 404 });
    }

    return NextResponse.json(updatedOffer);
  } catch (error: any) {
    console.error('Error claiming cashbridge offer:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

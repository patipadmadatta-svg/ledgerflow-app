import { NextResponse } from 'next/server';
import { createOffer } from '../../../../lib/dataLink';
import { calculatePayout } from '../../../../lib/cashbridge-math';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bill_id, amount, due_date, discount_rate } = body;

    if (!bill_id || amount === undefined || !due_date || discount_rate === undefined) {
      return NextResponse.json(
        { error: 'bill_id, amount, due_date, and discount_rate are required fields' },
        { status: 400 }
      );
    }

    const payoutAmount = calculatePayout(Number(amount), Number(discount_rate));

    const newOffer = await createOffer({
      bill_id,
      amount: Number(amount),
      due_date: new Date(due_date).toISOString(),
      discount_rate: Number(discount_rate),
      payout_amount: payoutAmount,
      status: 'ACTIVE'
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error: any) {
    console.error('Error listing cashbridge offer:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

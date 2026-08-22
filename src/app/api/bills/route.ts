import { NextResponse } from 'next/server';
import { getBills, createBill } from '@/lib/dataLink';
import { computeBillTotals } from '@/lib/ledgerMath';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    const bills = await getBills();
    const filteredBills = bills.filter((b: any) => (b.user_id || 'default-freelancer-id') === userId);
    const computedBills = filteredBills.map((bill) => {
      const totals = computeBillTotals(bill, bill.bill_lines || []);
      return {
        ...bill,
        ...totals,
        state: totals.derivedState // Apply derived state override on read
      };
    });
    return NextResponse.json(computedBills);
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    const body = await request.json();
    const { payer_id, due_date, levy_rate, service_fee, service_fee_settled, state, bill_lines } = body;

    if (!payer_id || !due_date || !bill_lines || !Array.isArray(bill_lines) || bill_lines.length === 0) {
      return NextResponse.json(
        { error: 'Payer ID, due date, and at least one bill line are required' },
        { status: 400 }
      );
    }

    const billData = {
      payer_id,
      due_date: new Date(due_date).toISOString(),
      levy_rate: Number(levy_rate || 0),
      service_fee: Number(service_fee || 0),
      service_fee_settled: Boolean(service_fee_settled || false),
      state: state || 'ISSUED',
      user_id: userId
    };

    const newBill = await createBill(billData, bill_lines);

    // Compute totals to return with computed values
    const totals = computeBillTotals(newBill, newBill.bill_lines || []);
    const responseData = {
      ...newBill,
      ...totals,
      state: totals.derivedState
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

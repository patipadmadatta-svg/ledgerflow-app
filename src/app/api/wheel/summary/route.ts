import { NextResponse } from 'next/server';
import { getBills } from '@/lib/dataLink';
import { computeBillTotals, computeWheelSummary } from '@/lib/ledgerMath';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    const bills = await getBills();
    const filteredBills = bills.filter((b: any) => (b.user_id || 'default-freelancer-id') === userId);
    const computedBills = filteredBills.map((bill) => {
      const totals = computeBillTotals(bill, bill.bill_lines || []);
      return {
        ...bill,
        ...totals
      };
    });

    const summary = computeWheelSummary(computedBills);
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error fetching wheel summary:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getBills } from '@/lib/dataLink';
import { computeBillTotals, computeWheelSummary } from '@/lib/ledgerMath';

export async function GET() {
  try {
    const bills = await getBills();
    const computedBills = bills.map((bill) => {
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

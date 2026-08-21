import { NextResponse } from 'next/server';
import { getPayerById, getBills } from '@/lib/dataLink';
import { computeBillTotals } from '@/lib/ledgerMath';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const payer = await getPayerById(id);
    if (!payer) {
      return NextResponse.json({ error: 'Payer not found' }, { status: 404 });
    }

    // Get all bills and filter by payer
    const allBills = await getBills();
    const payerBills = allBills.filter((bill) => bill.payer_id === id);

    // Compute derived totals for payer's bills
    const computedBills = payerBills.map((bill) => {
      const totals = computeBillTotals(bill, bill.bill_lines || []);
      return {
        ...bill,
        ...totals,
        state: totals.derivedState // Apply derived state override on read
      };
    });

    // Compute aggregate owed by this payer
    const totalOwed = computedBills.reduce((acc, bill) => acc + bill.totalOutstanding, 0);

    return NextResponse.json({
      ...payer,
      bills: computedBills,
      totalOwed: Math.round(totalOwed * 100) / 100
    });
  } catch (error: any) {
    console.error('Error fetching payer detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

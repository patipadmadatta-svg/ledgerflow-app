import { NextResponse } from 'next/server';
import { updateBillLine, getBillById } from '@/lib/dataLink';
import { computeBillTotals } from '@/lib/ledgerMath';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; lineId: string }> | { id: string; lineId: string } }
) {
  try {
    const params = await context.params;
    const { id: billId, lineId } = params;

    const body = await request.json();
    const allowedUpdates: any = {};

    if (body.settled !== undefined) allowedUpdates.settled = Boolean(body.settled);
    if (body.label !== undefined) allowedUpdates.label = String(body.label);
    if (body.unit_cost !== undefined) allowedUpdates.unit_cost = Number(body.unit_cost);
    if (body.unit_charge !== undefined) allowedUpdates.unit_charge = Number(body.unit_charge);
    if (body.qty !== undefined) allowedUpdates.qty = Number(body.qty);

    const updatedLine = await updateBillLine(billId, lineId, allowedUpdates);
    if (!updatedLine) {
      return NextResponse.json({ error: 'Bill line not found' }, { status: 404 });
    }

    // Return the updated bill and its computed totals so the frontend gets the latest state immediately
    const bill = await getBillById(billId);
    const totals = computeBillTotals(bill, bill.bill_lines || []);

    return NextResponse.json({
      line: updatedLine,
      bill: {
        ...bill,
        ...totals,
        state: totals.derivedState
      }
    });
  } catch (error: any) {
    console.error('Error updating bill line:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

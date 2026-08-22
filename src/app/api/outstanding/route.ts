import { NextResponse } from 'next/server';
import { getBills } from '@/lib/dataLink';
import { computeBillTotals } from '@/lib/ledgerMath';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    const bills = await getBills();
    const filteredBills = bills.filter((b: any) => (b.user_id || 'default-freelancer-id') === userId);

    // Group unsettled lines and service fees by payer
    const payersMap: Record<
      string,
      {
        payerId: string;
        payerName: string;
        phone: string;
        email?: string | null;
        unsettledLines: {
          billId: string;
          billNumber: string;
          lineId: string;
          label: string;
          unitCharge: number;
          qty: number;
          amount: number;
          dueDate: string;
        }[];
        unsettledFees: {
          billId: string;
          billNumber: string;
          serviceFee: number;
          dueDate: string;
        }[];
        totalOwed: number;
      }
    > = {};

    for (const bill of filteredBills) {
      const totals = computeBillTotals(bill, bill.bill_lines || []);

      const hasOutstandingLines = totals.outstandingLines > 0;
      const hasOutstandingFee = totals.outstandingFee > 0;

      if (hasOutstandingLines || hasOutstandingFee) {
        const payer = bill.payers;
        if (!payer) continue;

        if (!payersMap[payer.id]) {
          payersMap[payer.id] = {
            payerId: payer.id,
            payerName: payer.name,
            phone: payer.phone,
            email: payer.email,
            unsettledLines: [],
            unsettledFees: [],
            totalOwed: 0
          };
        }

        const group = payersMap[payer.id];

        // Gather unsettled lines
        if (bill.bill_lines) {
          for (const line of bill.bill_lines) {
            if (!line.settled) {
              const amount = line.unit_charge * line.qty;
              group.unsettledLines.push({
                billId: bill.id,
                billNumber: bill.bill_number,
                lineId: line.id,
                label: line.label,
                unitCharge: line.unit_charge,
                qty: line.qty,
                amount: Math.round(amount * 100) / 100,
                dueDate: bill.due_date
              });
            }
          }
        }

        // Gather unsettled fee
        if (!bill.service_fee_settled && bill.service_fee > 0) {
          group.unsettledFees.push({
            billId: bill.id,
            billNumber: bill.bill_number,
            serviceFee: bill.service_fee,
            dueDate: bill.due_date
          });
        }

        group.totalOwed += totals.totalOutstanding;
      }
    }

    // Convert map to sorted array
    const result = Object.values(payersMap)
      .map((payer) => ({
        ...payer,
        totalOwed: Math.round(payer.totalOwed * 100) / 100
      }))
      .sort((a, b) => b.totalOwed - a.totalOwed);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching outstanding items:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getUpiTransactions, createUpiTransaction, getBills, updateBill, updateBillLine } from '@/lib/dataLink';
import { computeBillTotals } from '@/lib/ledgerMath';
import { reconcileTransaction } from '@/lib/reconcile';

export async function GET() {
  try {
    const transactions = await getUpiTransactions();
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { utr, payerName, amount } = body;

    if (!utr || !payerName || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'UTR, payerName, and positive amount are required' },
        { status: 400 }
      );
    }

    // 1. Fetch and compute candidate bills
    const rawBills = await getBills();
    const candidateBills = rawBills.map(bill => {
      const totals = computeBillTotals(bill, bill.bill_lines || []);
      return {
        ...bill,
        ...totals
      };
    });

    // 2. Execute reconciliation logic
    const match = reconcileTransaction({ payerName, amount: Number(amount) }, candidateBills);

    // 3. Create UPI transaction record in the database
    const transactionData = {
      utr,
      payer_name: payerName,
      amount: Number(amount),
      matched_bill_id: match.matchedBillId,
      matched_line_id: match.matchedLineId,
      status: match.status
    };

    const newTransaction = await createUpiTransaction(transactionData);

    // 4. Apply database updates (mark settled) if matched
    if (match.status === 'MATCHED' && match.matchedBillId) {
      // Settle matching lines
      for (const lineId of match.linesToSettle) {
        await updateBillLine(match.matchedBillId, lineId, { settled: true });
      }

      // Settle service fee if applicable
      if (match.settleServiceFee) {
        await updateBill(match.matchedBillId, { service_fee_settled: true });
      }
    }

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      match
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error processing UPI transaction:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

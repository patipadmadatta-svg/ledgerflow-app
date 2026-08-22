import { NextResponse } from 'next/server';
import { updateUpiTransaction, updateBill, updateBillLine } from '@/lib/dataLink';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const { id: transactionId } = params;

    const body = await request.json();
    const { matchedBillId, matchedLineId, settleServiceFee } = body;

    if (!matchedBillId) {
      return NextResponse.json(
        { error: 'matchedBillId is required' },
        { status: 400 }
      );
    }

    // 1. Update the transaction record in the database
    const updatedTransaction = await updateUpiTransaction(transactionId, {
      matched_bill_id: matchedBillId,
      matched_line_id: matchedLineId || null,
      status: 'MATCHED'
    });

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // 2. Mark line or fee settled in the database
    if (matchedLineId) {
      await updateBillLine(matchedBillId, matchedLineId, { settled: true });
    } else if (settleServiceFee) {
      await updateBill(matchedBillId, { service_fee_settled: true });
    } else {
      // Default: Settle service fee if no line was specified
      await updateBill(matchedBillId, { service_fee_settled: true });
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction
    });

  } catch (error: any) {
    console.error('Error manually reconciling transaction:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

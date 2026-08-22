import { NextResponse } from 'next/server';
import { getBillById, updateBill, deleteBill, getUserById } from '@/lib/dataLink';
import { computeBillTotals } from '@/lib/ledgerMath';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';

    const bill = await getBillById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Load creator profile details for payment QR generation
    const creator = await getUserById(bill.user_id || 'default-freelancer-id');

    const totals = computeBillTotals(bill, bill.bill_lines || []);
    return NextResponse.json({
      ...bill,
      ...totals,
      state: totals.derivedState,
      freelancerUpiId: creator?.upi_id || 'freelancer@upi',
      freelancerName: creator?.payee_name || creator?.username || 'Freelancer'
    });
  } catch (error: any) {
    console.error('Error fetching bill detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';

    const bill = await getBillById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if ((bill.user_id || 'default-freelancer-id') !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowedUpdates: any = {};

    if (body.state !== undefined) allowedUpdates.state = body.state;
    if (body.levy_rate !== undefined) allowedUpdates.levy_rate = Number(body.levy_rate);
    if (body.service_fee !== undefined) allowedUpdates.service_fee = Number(body.service_fee);
    if (body.service_fee_settled !== undefined) allowedUpdates.service_fee_settled = Boolean(body.service_fee_settled);
    if (body.due_date !== undefined) allowedUpdates.due_date = new Date(body.due_date).toISOString();

    const updatedBill = await updateBill(id, allowedUpdates);
    if (!updatedBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const totals = computeBillTotals(updatedBill, updatedBill.bill_lines || []);
    return NextResponse.json({
      ...updatedBill,
      ...totals,
      state: totals.derivedState // Apply derived state override on read
    });
  } catch (error: any) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';

    const bill = await getBillById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if ((bill.user_id || 'default-freelancer-id') !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await deleteBill(id);
    if (!success) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

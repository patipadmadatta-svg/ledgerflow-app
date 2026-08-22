import { NextResponse } from 'next/server';
import { getUserById, updateUserProfile } from '@/lib/dataLink';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      upiId: user.upi_id || '',
      payeeName: user.payee_name || user.username || ''
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { upiId, payeeName } = await request.json();

    if (!upiId || !payeeName) {
      return NextResponse.json({ error: 'UPI ID and payee name are required' }, { status: 400 });
    }

    await updateUserProfile(userId, {
      upi_id: upiId.trim(),
      payee_name: payeeName.trim()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

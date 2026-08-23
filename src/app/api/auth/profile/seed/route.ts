import { NextResponse } from 'next/server';
import { seedUserDemoData } from '@/lib/dataLink';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    if (userId === 'default-freelancer-id') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await seedUserDemoData(userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

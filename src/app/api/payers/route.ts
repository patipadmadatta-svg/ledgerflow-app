import { NextResponse } from 'next/server';
import { getPayers, createPayer, seedUserDemoData } from '@/lib/dataLink';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    
    if (userId !== 'default-freelancer-id') {
      await seedUserDemoData(userId);
    }

    const payers = await getPayers();
    const filteredPayers = payers.filter((p: any) => (p.user_id || 'default-freelancer-id') === userId);
    return NextResponse.json(filteredPayers);
  } catch (error: any) {
    console.error('Error fetching payers:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-freelancer-id';
    const body = await request.json();
    const { name, phone, email, address } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required fields' }, { status: 400 });
    }

    const newPayer = await createPayer({ 
      name, 
      phone, 
      email, 
      address,
      user_id: userId
    });
    return NextResponse.json(newPayer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payer:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


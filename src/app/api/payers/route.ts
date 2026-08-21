import { NextResponse } from 'next/server';
import { getPayers, createPayer } from '@/lib/dataLink';

export async function GET() {
  try {
    const payers = await getPayers();
    return NextResponse.json(payers);
  } catch (error: any) {
    console.error('Error fetching payers:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required fields' }, { status: 400 });
    }

    const newPayer = await createPayer({ name, phone, email, address });
    return NextResponse.json(newPayer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payer:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

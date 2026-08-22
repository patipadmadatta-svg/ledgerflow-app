import { NextResponse } from 'next/server';
import { getOtp, deleteOtp, getUserByEmail } from '@/lib/dataLink';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const savedOtpRecord = await getOtp(email);

    if (!savedOtpRecord || savedOtpRecord.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Clean up OTP on successful match
    await deleteOtp(email);

    // Check if user already has an account
    const user = await getUserByEmail(email);

    return NextResponse.json({
      success: true,
      registered: !!user
    });

  } catch (error: any) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

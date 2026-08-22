import { NextResponse } from 'next/server';
import { saveOtp } from '@/lib/dataLink';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Generate a random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to database
    await saveOtp(email, otp);

    const hasSmtpConfig = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    let sentRealEmail = false;

    if (hasSmtpConfig) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"LedgerFlow Auth" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'LedgerFlow Verification Code',
          text: `Your LedgerFlow verification code is: ${otp}\n\nThis code will expire shortly.`,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 450px;">
                  <h2 style="color: #6366f1;">LedgerFlow</h2>
                  <p>Your verification code is:</p>
                  <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 0.1em; border-radius: 6px;">
                    ${otp}
                  </div>
                  <p style="color: #666; font-size: 12px; margin-top: 20px;">If you did not request this code, please ignore this email.</p>
                 </div>`
        });

        sentRealEmail = true;
        console.log(`[AUTH] Sent real email to ${email} with OTP ${otp}`);
      } catch (err) {
        console.error('[AUTH] Failed to send real email via Nodemailer:', err);
      }
    }

    // Output code to console as backup/fallback
    console.log(`[AUTH LOGGER] Email: ${email} | Code: ${otp}`);

    return NextResponse.json({
      success: true,
      devMode: !sentRealEmail,
      devOtp: sentRealEmail ? null : otp // Return OTP for easy debugging if SMTP fails
    });

  } catch (error: any) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

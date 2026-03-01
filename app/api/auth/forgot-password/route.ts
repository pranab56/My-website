import { generateOTP } from '@/lib/auth-utils';
import { sendOTPEmail } from '@/lib/mail-utils';
import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDb('tradelog_main');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    if (!user) {
      // For security, don't reveal if user doesn't exist, but here we'll keep it simple
      return NextResponse.json({ error: 'User with this email does not exist' }, { status: 404 });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpiry } }
    );

    await sendOTPEmail(email, otp);

    return NextResponse.json({ message: 'OTP sent to your email' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

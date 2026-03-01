import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const db = await getDb('tradelog_main');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { otp: "", otpExpiry: "" }
      }
    );

    return NextResponse.json({ message: 'Email verified successfully. You can now login.' });

  } catch (err: unknown) {
    console.error('Email verification error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

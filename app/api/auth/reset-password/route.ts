import { hashPassword } from '@/lib/auth-utils';
import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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

    const hashedPassword = await hashPassword(newPassword);

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { otp: "", otpExpiry: "" }
      }
    );

    return NextResponse.json({ message: 'Password reset successful. You can now login.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

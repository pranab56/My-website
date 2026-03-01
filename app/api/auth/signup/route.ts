import { generateOTP, hashPassword } from '@/lib/auth-utils';
import { sendOTPEmail } from '@/lib/mail-utils';
import { getDb } from '@/lib/mongodb-client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb('tradelog_main');
    const usersCollection = db.collection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Create unique database name for this user
    // e.g., user_65ad... (shortened mongo id or slug)
    const userDbName = `user_${email.replace(/[@.]/g, '_')}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser = {
      name,
      email,
      password: hashedPassword,
      dbName: userDbName,
      isVerified: false,
      otp,
      otpExpiry,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      message: 'Signup successful. Please check your email for verification code.',
      email
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

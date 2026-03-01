import { TokenPayload, verifyToken } from '@/lib/auth-utils';
import { getUserDb } from '@/lib/mongodb-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const db = await getUserDb(decoded.dbName);
    const records = await db.collection('trades').find({}).sort({ date: -1 }).toArray();

    return NextResponse.json(records);
  } catch (error: unknown) {
    console.error('Fetch trades error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { date, profit, loss, riskRewardRatio, notes, tags } = body;

    // Validation
    if (!date || (profit === undefined && loss === undefined) || !riskRewardRatio) {
      return NextResponse.json({ error: 'Date, profit/loss, and risk-reward ratio are mandatory' }, { status: 400 });
    }

    // Strict format validation for risk-reward ratio (e.g., 1:3)
    const rrRegex = /^\d+:\d+$/;
    if (!rrRegex.test(riskRewardRatio)) {
      return NextResponse.json({ error: 'Risk-Reward Ratio must be in format 1:3' }, { status: 400 });
    }

    // Mutual exclusivity validation
    if (profit > 0 && loss > 0) {
      return NextResponse.json({ error: 'Cannot have both profit and loss' }, { status: 400 });
    }

    const db = await getUserDb(decoded.dbName);
    const tradesCollection = db.collection('trades');


    const newTrade = {
      date: new Date(date),
      profit: parseFloat(profit) || 0,
      loss: parseFloat(loss) || 0,
      riskRewardRatio,
      notes: notes || '',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await tradesCollection.insertOne(newTrade);

    return NextResponse.json({ ...newTrade, _id: result.insertedId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create trade error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

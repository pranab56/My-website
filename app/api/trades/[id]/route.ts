import { TokenPayload, verifyToken } from '@/lib/auth-utils';
import { getUserDb } from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getUserDb(decoded.dbName);
    const record = await db.collection('trades').findOne({ _id: new ObjectId(params.id) });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const body = await request.json();
    const { profit, loss, riskRewardRatio } = body;

    // Validation if present
    if (riskRewardRatio) {
      const rrRegex = /^\d+:\d+$/;
      if (!rrRegex.test(riskRewardRatio)) {
        return NextResponse.json({ error: 'Risk-Reward Ratio must be in format 1:3' }, { status: 400 });
      }
    }

    if (profit !== undefined && loss !== undefined) {
      if (parseFloat(profit) > 0 && parseFloat(loss) > 0) {
        return NextResponse.json({ error: 'Cannot have both profit and loss' }, { status: 400 });
      }
    }

    const db = await getUserDb(decoded.dbName);

    // Convert string numeric values to numbers if they exist
    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (typeof updateData.profit === 'string') updateData.profit = parseFloat(updateData.profit);
    if (typeof updateData.loss === 'string') updateData.loss = parseFloat(updateData.loss);
    if (typeof updateData.date === 'string') updateData.date = new Date(updateData.date);
    delete updateData.id; // Don't update the ID field itself

    const result = await db.collection('trades').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Update trade error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getUserDb(decoded.dbName);
    const result = await db.collection('trades').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

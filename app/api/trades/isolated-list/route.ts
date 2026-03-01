import { TokenPayload, verifyToken } from '@/lib/auth-utils';
import { getUserDb } from '@/lib/mongodb-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Example of an isolated API route. 
 * This route automatically routes to the user's specific database.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 0 });
    }

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Connect to the user's ISOLATED database
    const db = await getUserDb(decoded.dbName);

    // Fetch trades from the 'trades' collection in their PRIVATE database
    const trades = await db.collection('trades').find({}).sort({ date: -1 }).toArray();

    return NextResponse.json({
      success: true,
      dbName: decoded.dbName, // For demonstration
      trades
    });

  } catch (error) {
    console.error('Isolated data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch isolated data' }, { status: 500 });
  }
}

import { TokenPayload, verifyToken } from '@/lib/auth-utils';
import { getUserDb } from '@/lib/mongodb-client';
import { GridFSBucket, ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const galleryCollection = db.collection('gallery');

    // Find the item first to make sure it exists
    const item = await galleryCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If item has a fileId, delete from GridFS
    if (item.fileId) {
      const bucket = new GridFSBucket(db, { bucketName: 'gallery_files' });
      try {
        await bucket.delete(new ObjectId(item.fileId));
      } catch (fsErr) {
        console.error('Failed to delete GridFS file:', fsErr);
        // Continue deleting the DB record anyway
      }
    }

    // Deletefrom the gallery collection
    await galleryCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Delete gallery error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { fileName, folder } = await request.json();
    const db = await getUserDb(decoded.dbName);
    const galleryCollection = db.collection('gallery');

    const updateData: any = {};
    if (fileName) updateData.fileName = fileName;
    if (folder) updateData.folder = folder;

    const result = await galleryCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Update gallery error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { TokenPayload, verifyToken } from '@/lib/auth-utils';
import { getUserDb } from '@/lib/mongodb-client';
import { GridFSBucket, ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) {
      return new NextResponse('Invalid session', { status: 401 });
    }

    const db = await getUserDb(decoded.dbName);

    // 1. Find the gallery item to get the fileId
    const galleryItem = await db.collection('gallery').findOne({ _id: new ObjectId(id) });
    if (!galleryItem) {
      return new NextResponse('Item not found', { status: 404 });
    }

    if (!galleryItem.fileId) {
      // Legacy item with base64 data only
      if (galleryItem.data && galleryItem.data.startsWith('data:')) {
        // This shouldn't happen if the GET /api/gallery logic is followed,
        // but as a fallback we could return the base64 part.
        // However, it's better to just redirect or return error if data is missing.
        return new NextResponse('This item is not stored in GridFS', { status: 400 });
      }
      return new NextResponse('File ID missing', { status: 404 });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'gallery_files' });
    const fileId = new ObjectId(galleryItem.fileId);

    // 2. Check if file exists in GridFS
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return new NextResponse('File not found in storage', { status: 404 });
    }

    const file = files[0];

    // 3. Create a stream from GridFS
    const stream = bucket.openDownloadStream(fileId);

    // 4. Return as a Next.js Response (streaming)
    // Using a custom ReadableStream to perfectly handle client disconnects and prevent "Controller is already closed" errors.
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          try {
            if (controller.desiredSize !== null) {
              controller.enqueue(chunk);
            }
          } catch (e) {
            // Client likely disconnected
            stream.destroy();
          }
        });

        stream.on('end', () => {
          try {
            controller.close();
          } catch (e) {
            // Ignore if already closed
          }
        });

        stream.on('error', (err) => {
          try {
            controller.error(err);
          } catch (e) {
            // Ignore if already closed
          }
        });
      },
      cancel() {
        stream.destroy();
      }
    });

    console.log(`[GalleryView] Streaming file: ${file.filename} (Type: ${file.metadata?.contentType}, Size: ${file.length})`);

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': file.metadata?.contentType || 'application/octet-stream',
        'Content-Length': file.length.toString(),
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (err: unknown) {
    console.error('Streaming error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
    const fileSize = file.length;
    const contentType = file.metadata?.contentType || 'application/octet-stream';

    // 3. Handle Range Requests (Very important for video seeking and performance)
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        return new NextResponse('Requested range not satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` }
        });
      }

      const chunksize = (end - start) + 1;
      const downloadStream = bucket.openDownloadStream(fileId, {
        start,
        end: end + 1 // GridFS end is exclusive
      });

      const webStream = new ReadableStream({
        start(controller) {
          downloadStream.on('data', (chunk) => {
            try {
              if (controller.desiredSize !== null) {
                controller.enqueue(chunk);
              }
            } catch (_e) {
              downloadStream.destroy();
            }
          });

          downloadStream.on('end', () => {
            try { controller.close(); } catch (_e) { }
          });

          downloadStream.on('error', (err) => {
            try { controller.error(err); } catch (_e) { }
          });
        },
        cancel() {
          downloadStream.destroy();
        }
      });

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 4. Default stream for full file
    const stream = bucket.openDownloadStream(fileId);
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          try {
            if (controller.desiredSize !== null) {
              controller.enqueue(chunk);
            }
          } catch (_e) {
            stream.destroy();
          }
        });

        stream.on('end', () => {
          try { controller.close(); } catch (_e) { }
        });

        stream.on('error', (err) => {
          try { controller.error(err); } catch (_e) { }
        });
      },
      cancel() {
        stream.destroy();
      }
    });

    console.log(`[GalleryView] Streaming file: ${file.filename} (Type: ${contentType}, Size: ${fileSize})`);

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (err: unknown) {
    console.error('Streaming error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

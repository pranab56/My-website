import { TokenPayload, verifyToken } from '@/lib/auth-utils';
import { getUserDb } from '@/lib/mongodb-client';
import Busboy from 'busboy';
import { GridFSBucket, ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

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
    const galleryItems = await db.collection('gallery').find({}).sort({ createdAt: -1 }).toArray();

    // Mapping to include correct streaming URLs for GridFS items
    const gallery = galleryItems.map(item => {
      let dataUrl = item.data; // default to existing base64
      if (item.fileId) {
        // Use streaming route for GridFS files
        dataUrl = `/api/gallery/view/${item._id.toString()}`;
      }
      return {
        ...item,
        _id: item._id.toString(),
        data: dataUrl
      };
    });

    return NextResponse.json(gallery);
  } catch (err: unknown) {
    console.error('Fetch gallery error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getUserDb(decoded.dbName);

    // CHK: If JSON request (for YouTube links)
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.type === 'youtube') {
        const galleryItem = {
          type: 'youtube',
          fileName: body.fileName || 'YouTube Video',
          data: body.url, // The YouTube URL
          mimeType: 'video/youtube',
          size: 0,
          folder: body.folder || 'Root',
          userId: decoded.id,
          createdAt: new Date()
        };
        const result = await db.collection('gallery').insertOne(galleryItem);
        return NextResponse.json({ ...galleryItem, _id: result.insertedId.toString() }, { status: 201 });
      }
    }

    const bucket = new GridFSBucket(db, { bucketName: 'gallery_files' });

    interface UploadResult {
      fileId: ObjectId;
      fileName: string;
      mimeType: string;
      size: number;
      folder?: string;
    }

    interface ExtendedBusboy extends Busboy.Busboy {
      _allFinished?: boolean;
    }

    // Use a promise to handle the multipart streaming
    const uploadResult = await new Promise<UploadResult>((resolve, reject) => {
      const busboy = Busboy({ headers: { 'content-type': request.headers.get('content-type') || '' } }) as ExtendedBusboy;
      let uploadsInProgress = 0;
      let lastFileResult: UploadResult | null = null;
      let folder: string | undefined;

      busboy.on('field', (name, val) => {
        if (name === 'folder') folder = val;
      });

      busboy.on('file', (name, fileStream, info) => {
        uploadsInProgress++;
        const currentFileName = info.filename;
        const currentMimeType = info.mimeType;

        const uploadStream = bucket.openUploadStream(currentFileName, {
          metadata: { userId: decoded.id, contentType: currentMimeType }
        });

        let currentFileSize = 0;
        fileStream.on('data', (data) => {
          currentFileSize += data.length;
        });

        fileStream.pipe(uploadStream);

        uploadStream.on('error', (err) => {
          console.error("GridFS Upload Stream Error:", err);
          reject(err);
        });

        uploadStream.on('finish', () => {
          lastFileResult = { fileId: uploadStream.id, fileName: currentFileName, mimeType: currentMimeType, size: currentFileSize, folder };
          uploadsInProgress--;
          if (uploadsInProgress === 0 && busboy._allFinished) {
            resolve(lastFileResult);
          }
        });
      });

      busboy.on('finish', () => {
        busboy._allFinished = true;
        if (uploadsInProgress === 0 && lastFileResult) {
          resolve(lastFileResult);
        } else if (uploadsInProgress === 0 && !lastFileResult) {
          reject(new Error('No file found in the request'));
        }
      });

      busboy.on('error', (err) => {
        console.error("Busboy Error:", err);
        reject(err);
      });

      // Convert Web Stream to Node Stream and pipe to Busboy
      if (!request.body) {
        reject(new Error('No request body'));
        return;
      }
      const nodeStream = Readable.fromWeb(request.body as import('stream/web').ReadableStream<Uint8Array>);
      nodeStream.pipe(busboy);
    });

    const itemId = new ObjectId();
    const dataUrl = `/api/gallery/view/${itemId.toString()}`;
    const isVideo = uploadResult.mimeType.startsWith('video/');

    const galleryItem = {
      _id: itemId,
      fileId: uploadResult.fileId,
      type: isVideo ? 'video' : 'image',
      fileName: uploadResult.fileName,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      folder: uploadResult.folder || 'Root',
      userId: decoded.id,
      createdAt: new Date(),
      data: dataUrl // Saving the direct URL in the DB as requested
    };

    await db.collection('gallery').insertOne(galleryItem);

    return NextResponse.json({
      ...galleryItem,
      _id: itemId.toString()
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('GridFS POST Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}

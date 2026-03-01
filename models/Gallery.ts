import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Optional for legacy base64 items
  },
  data: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ['image', 'video', 'youtube'],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
  },
  folder: {
    type: String,
    default: 'Root',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);

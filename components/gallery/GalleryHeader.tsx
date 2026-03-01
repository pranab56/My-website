"use client";

import { Button } from '@/components/ui/button';
import { Loader2, Maximize2, Play, Upload } from 'lucide-react';

interface GalleryHeaderProps {
  uploading: boolean;
  uploadInfo: { current: number; total: number } | null;
  uploadProgress: number | null;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GalleryHeader({
  uploading,
  uploadInfo,
  uploadProgress,
  onUploadClick,
  fileInputRef,
  handleUpload
}: GalleryHeaderProps) {
  return (
    <div className="relative p-3 rounded-xl bg-card border border-border shadow-2xl overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Maximize2 className="w-48 h-48 text-primary" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary">Media Vault</h1>
          <p className="text-muted-foreground font-medium flex items-center text-[10px] md:text-xs">
            <Play className="w-3.5 h-3.5 mr-2 text-primary opacity-70" />
            Capture your evolution. Store your legacy.
          </p>
        </div>

        <div className="flex items-center w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleUpload}
            accept="image/*,video/*"
            multiple
          />
          <Button
            onClick={onUploadClick}
            disabled={uploading}
            className="w-full md:w-auto rounded-xl h-11 md:h-12 px-6 md:px-8 shadow-xl cursor-pointer shadow-primary/20 font-black uppercase tracking-widest active:scale-95 transition-all text-white text-[10px] md:text-xs bg-primary hover:bg-primary/90"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            )}
            {uploading ? `Processing ${uploadInfo?.current}/${uploadInfo?.total}` : 'Upload Media'}
          </Button>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {uploading && uploadProgress !== null && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent/20">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from '@/components/ui/button';
import { GalleryItem as GalleryItemType } from '@/features/gallery/galleryApi';
import { cn } from '@/lib/utils';
import { Check, Download, Edit2, Image as ImageIcon, Loader2, Play, Trash2, Video as VideoIcon, Youtube } from 'lucide-react';
import { useState } from 'react';

interface GalleryItemProps {
  item: GalleryItemType;
  isSelected?: boolean;
  onSelect?: (id: string, select: boolean) => void;
  onRename?: (item: GalleryItemType) => void;
  onPreview: (item: GalleryItemType) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (url: string, fileName: string, e?: React.MouseEvent) => void;
  formatSize: (bytes: number) => string;
}

export default function GalleryItem({
  item,
  isSelected,
  onSelect,
  onRename,
  onPreview,
  onDelete,
  onDownload,
  formatSize
}: GalleryItemProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const getYoutubeThumbnail = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const id = (match && match[2].length === 11) ? match[2] : null;
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    } catch {
      return null;
    }
  };

  const youtubeThumbnail = item.type === 'youtube' ? getYoutubeThumbnail(item.data) : null;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl",
        isSelected ? "border-primary ring-2 ring-primary/20 scale-[0.98]" : "border-border/50 hover:border-primary/50"
      )}
    >
      {/* Checkbox Overlay */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(item._id, !isSelected);
        }}
        className={cn(
          "absolute top-4 left-4 z-50 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
          isSelected ? "bg-primary border-primary text-white" : "bg-black/20 border-white/40 opacity-0 group-hover:opacity-100 backdrop-blur-md"
        )}
      >
        {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
      </div>

      <div onClick={() => onPreview(item)}>
        {/* Media Component */}
        <div className="aspect-square relative flex items-center justify-center bg-black overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/20 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {item.type === 'image' || (item.type === 'youtube' && youtubeThumbnail) ? (
            <img
              src={item.type === 'image' ? item.data : youtubeThumbnail!}
              alt={item.fileName}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
            />
          ) : item.type === 'video' ? (
            <div className="w-full h-full relative">
              <video
                src={item.data}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-500",
                  isLoaded ? "opacity-80" : "opacity-0"
                )}
                muted
                preload="metadata"
                onCanPlay={() => setIsLoaded(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 opacity-100 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative bg-loss/5 flex items-center justify-center">
              <Youtube className="w-20 h-20 text-loss opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 rounded-full bg-loss/10 backdrop-blur-md text-loss border border-loss/20 opacity-100 group-hover:bg-loss group-hover:text-white group-hover:scale-110 transition-all">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
              </div>
            </div>
          )}

          {/* Folder Tag */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase text-white tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            {item.folder || 'Root'}
          </div>

          {/* Overlay Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-white font-black uppercase text-[10px] tracking-widest truncate">
                  {item.fileName}
                </p>
                <span className="text-white/60 font-black text-[8px] uppercase tracking-tighter">{formatSize(item.size)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename?.(item);
                }}
                className="rounded-xl h-8 w-8 bg-white/10 hover:bg-primary text-white border-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => onDownload(item.data, item.fileName, e)}
                className="flex-1 rounded-xl h-9 bg-white/10 hover:bg-white/20 text-white font-black uppercase text-[9px] tracking-widest border-0"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => onDelete(item._id, e)}
                className="rounded-xl h-9 w-9 bg-loss/80 hover:bg-loss transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Left Icon Badge */}
          <div className="absolute bottom-4 left-4 p-2 rounded-xl bg-background/60 backdrop-blur-md border border-white/10 text-muted-foreground group-hover:opacity-0 transition-opacity">
            {item.type === 'image' ? <ImageIcon className="w-4 h-4" /> : item.type === 'video' ? <VideoIcon className="w-4 h-4" /> : <Youtube className="w-4 h-4 text-loss" />}
          </div>
        </div>
      </div>
    </div>
  );
}



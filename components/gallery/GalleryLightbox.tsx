"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GalleryItem } from '@/features/gallery/galleryApi';
import { cn } from '@/lib/utils';
import { Download, Info, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface GalleryLightboxProps {
  item: GalleryItem;
  onClose: () => void;
  onDownload: (url: string, fileName: string) => void;
  formatSize: (bytes: number) => string;
}

export default function GalleryLightbox({ item, onClose, onDownload, formatSize }: GalleryLightboxProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // Reset loading state when item changes
    setIsLoading(true);
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      {/* 
        Use a custom layout inside DialogContent. 
        We hide the default close button using CSS or just add our own beautiful wrapper. 
      */}
      <DialogContent className=" md:max-w-2xl w-full h-[100vh] sm:h-[90vh] p-0 bg-white/5 backdrop-blur-lg border-border/20 shadow-2xl flex flex-col overflow-hidden sm:rounded-xl duration-300">
        <DialogHeader className="sr-only">
          <DialogTitle>{item.fileName}</DialogTitle>
        </DialogHeader>

        {/* Media Preview Area */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center p-7 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          )}

          {item.type === 'image' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={item.data}
                alt={item.fileName}
                className={cn(
                  "max-w-full max-h-full object-contain rounded-xl transition-all duration-500",
                  isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : item.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center drop-shadow-2xl">
              <video
                src={item.data}
                controls
                autoPlay
                playsInline
                onLoadedData={() => setIsLoading(false)}
                className={cn(
                  "max-w-full max-h-full rounded-xl transition-opacity duration-500",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black/40 rounded-xl overflow-hidden">
              {isMounted && (
                <ReactPlayer
                  url={item.data}
                  controls
                  playing
                  width="100%"
                  height="100%"
                  onReady={() => setIsLoading(false)}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1, autoplay: 1 }
                    }
                  }}
                  style={{ borderRadius: '0.75rem' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom Info & Action Bar */}
        <div className="bg-card border-t border-white/5 p-4 sm:p-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0 hidden sm:flex">
              <Info className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 sm:flex-none">
              <h3 className="text-lg sm:text-2xl font-medium text-foreground pr-4">
                {item.fileName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-medium  mt-1 text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-accent/30 text-accent-foreground border border-border/50">{item.mimeType}</span>
                <span className="hidden sm:inline">•</span>
                <span>{formatSize(item.size)}</span>
                <span className="hidden sm:inline">•</span>
                <span>{item.folder || 'Root Vault'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              onClick={() => onDownload(item.data, item.fileName)}
              className="flex-1 sm:flex-none rounded-xl h-12 px-8 bg-primary text-white font-medium active:scale-95 transition-all text-xs shadow-xl shadow-primary/20 cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              Direct Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}

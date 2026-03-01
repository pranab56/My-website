"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AtSign, Camera, Image as ImageIcon, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';

interface SettingsHeaderProps {
  name: string;
  username: string;
  profileImage: string;
  coverImage: string;
  isUploading: 'profile' | 'cover' | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => void;
}

const SettingsHeader = ({
  name,
  username,
  profileImage,
  coverImage,
  isUploading,
  handleFileUpload
}: SettingsHeaderProps) => {
  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 rounded-3xl overflow-hidden relative group bg-accent/20 border border-border">
        {coverImage ? (
          <Image fill src={coverImage} alt="Cover" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="cursor-pointer">
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'cover')}
              disabled={!!isUploading}
            />
            <Button variant="secondary" asChild className="rounded-full h-10 px-4 font-semibold shadow-xl">
              <span>
                {isUploading === 'cover' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                Change Cover
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Profile Photo Overlap */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative group self-center md:self-auto">
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-background bg-card overflow-hidden shadow-2xl relative">
            {profileImage ? (
              <Image fill src={profileImage} alt="Profile" className="object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'profile')}
                  disabled={!!isUploading}
                />
                <div className="p-2.5 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors border border-white/20">
                  {isUploading === 'profile' ? <Loader2 className="w-4 h-4 md:w-6 md:h-6 animate-spin" /> : <Camera className="w-4 h-4 md:w-6 md:h-6" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="text-center md:text-left md:-ml-2 space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{name || 'Your Name'}</h2>
          <p className="text-muted-foreground font-bold flex items-center justify-center md:justify-start text-xs md:text-sm">
            <AtSign className="w-3 md:w-4 h-3 md:h-4 mr-1 opacity-50" /> {username || 'username'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(SettingsHeader);

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AtSign, FileText, Hash, User } from 'lucide-react';
import { memo } from 'react';

interface ProfileSectionProps {
  name: string;
  setName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
}

const ProfileSection = ({
  name,
  setName,
  username,
  setUsername,
  bio,
  setBio
}: ProfileSectionProps) => {
  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm p-0">
      <CardHeader className="p-6 md:p-8 pb-4 md:pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 md:p-3 rounded-2xl bg-primary/10 text-primary shrink-0 transition-transform hover:scale-110">
            <User className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-lg md:text-xl ">Identity & Bio</CardTitle>
            <CardDescription className=" text-[10px] md:text-xs">How others see you in the network.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2.5">
            <Label className="text-base md:text-base flex items-center text-muted-foreground">
              <Hash className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2 text-primary" /> Full Display Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-accent/5 border-border/50 h-11 md:h-12 rounded-2xl focus-visible:ring-primary/20  text-sm md:text-base focus:bg-background/50 transition-all"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-base md:text-base flex items-center text-muted-foreground">
              <AtSign className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2 text-primary" /> Trading Alias
            </Label>
            <Input
              placeholder="trader_name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-accent/5 border-border/50 h-11 md:h-12 rounded-2xl focus-visible:ring-primary/20  text-sm md:text-base focus:bg-background/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-base md:text-base flex items-center text-muted-foreground">
            <FileText className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2 text-primary" /> Professional Bio
          </Label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your trading philosophy..."
            className="w-full bg-accent/5 border border-border/50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20  text-sm md:text-base resize-none shadow-inner focus:bg-background/50 transition-all min-h-[120px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(ProfileSection);

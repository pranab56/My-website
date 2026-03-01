"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Key, ShieldCheck } from 'lucide-react';
import { memo } from 'react';

interface SecuritySectionProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
}

const SecuritySection = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword
}: SecuritySectionProps) => {
  return (
    <Card className="border-border bg-card/40 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border-l-4 border-l-amber-500/50 p-0">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Security Protocol</CardTitle>
            <CardDescription className="font-semibold">Manage your access and encryption.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center">
              <Key className="w-3.5 h-3.5 mr-1" /> Current Password
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-accent/5 border-border h-12 rounded-2xl focus-visible:ring-primary/20 font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center">
              <Key className="w-3.5 h-3.5 mr-1" /> New Security Key
            </Label>
            <Input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-accent/5 border-border h-12 rounded-2xl focus-visible:ring-primary/20 font-semibold"
            />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground font-semibold italic leading-relaxed">
            Leave password fields empty if you don&apos;t wish to change your credentials. Updating password will require the correct current password.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(SecuritySection);

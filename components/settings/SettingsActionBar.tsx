"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Loader2, Save } from 'lucide-react';
import { memo } from 'react';

interface SettingsActionBarProps {
  sessionDate: Date | undefined;
  message: { text: string; type: 'success' | 'error' } | null;
  isUpdating: boolean;
  handleSave: () => void;
}

const SettingsActionBar = ({
  sessionDate,
  message,
  isUpdating,
  handleSave
}: SettingsActionBarProps) => {
  return (
    <div className="mt-20 md:mt-24 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-12 md:pt-16">
      <div className="hidden">
        {/* Intentionally left hidden as SettingsHeader now handles mobile profile name */}
      </div>
      <div className="flex flex-col sm:flex-row md:items-center gap-4 w-full">
        <div className="flex-1">
          <p className="text-muted-foreground text-[10px] md:text-sm font-black uppercase tracking-widest flex items-center bg-accent/10 px-4 md:px-5 py-2.5 md:py-2 rounded-xl border border-border/50 w-full sm:w-fit justify-center sm:justify-start">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-primary" />
            Session: {sessionDate ? format(sessionDate, 'MMMM yyyy') : 'N/A'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {message && (
            <div className={cn(
              "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4 w-full sm:w-auto justify-center border",
              message.type === 'success' ? 'bg-profit/10 text-profit border-profit/20' : 'bg-loss/10 text-loss border-loss/20'
            )}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full sm:w-auto rounded-xl px-8 h-12 shadow-2xl cursor-pointer shadow-primary/20 font-black uppercase tracking-widest active:scale-95 transition-all md:transition-transform disabled:opacity-50 text-white bg-primary hover:bg-primary/90 text-[10px] md:text-xs"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 md:w-5 md:h-5 mr-2" />}
            Commit Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(SettingsActionBar);

"use client";

import { Star } from 'lucide-react';

export default function TodoStats() {
  return (
    <div className="p-8 rounded-[40px] bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 shadow-2xl flex items-center space-x-6">
      <div className="p-4 rounded-[28px] bg-primary/20 text-primary animate-pulse">
        <Star className="w-8 h-8 fill-current" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-1">Commander&apos;s Insight</h4>
        <p className="text-base text-muted-foreground font-bold leading-tight">
          &quot;Small wings move great weight. Complete your next task and keep the momentum. The market rewards the disciplined.&quot;
        </p>
      </div>
    </div>
  );
}

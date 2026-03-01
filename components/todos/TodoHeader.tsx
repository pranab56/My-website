"use client";

import { Progress } from "@/components/ui/progress";
import { Target, Zap } from 'lucide-react';

interface TodoHeaderProps {
  progress: number;
}

export default function TodoHeader({ progress }: TodoHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary">Operation: Discipline</h1>
        <p className="text-muted-foreground font-medium flex items-center text-xs md:text-sm">
          <Target className="w-4 h-4 mr-2 text-primary opacity-70" />
          Success is the sum of small, repeated actions.
        </p>
      </div>
      <div className="bg-card border border-border p-4 px-4 md:px-6 rounded-2xl shadow-xl flex items-center space-x-4 md:space-x-6 w-full md:min-w-[400px] lg:min-w-[500px]">
        <div className="flex-1 space-y-1.5 md:space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span>Progress</span>
            <span className="text-primary font-black">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full bg-accent/20" />
        </div>
        <div className="p-2.5 md:p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
          <Zap className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
}

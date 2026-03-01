"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Star } from 'lucide-react';

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export default function TodoInput({ value, onChange, onAdd, isLoading }: TodoInputProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative flex items-center gap-2 bg-card/60 backdrop-blur-xl border-2 border-border/50 rounded-2xl p-1.5 md:p-2 pr-3 md:pr-4 shadow-2xl focus-within:border-primary/50 transition-colors">
        <div className="p-2 md:p-4 text-primary shrink-0 transition-transform group-focus-within:scale-110">
          <Star className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <Input
          placeholder="New mission..."
          className="border-0 bg-transparent h-10 md:h-12 w-full text-base md:text-lg font-normal placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && onAdd()}
          disabled={isLoading}
        />
        <Button
          onClick={onAdd}
          disabled={isLoading || !value.trim()}
          className="rounded-xl h-10 md:h-12 w-12 md:w-20 cursor-pointer p-0 shadow-lg shadow-primary/30 active:scale-95 transition-all bg-primary hover:bg-primary/90"
        >
          {isLoading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Plus className="w-5 h-5 md:w-6 md:h-6" />}
        </Button>
      </div>
    </div>
  );
}

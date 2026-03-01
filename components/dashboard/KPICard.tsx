"use client";

import { LucideIcon } from 'lucide-react';
import { useRef } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function KPICard({ title, value, icon: Icon, trend, color = 'primary' }: KPICardProps) {
  const cardRef = useRef(null);


  return (
    <div
      ref={cardRef}
      className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}/5 rounded-full group-hover:scale-150 transition-transform duration-500`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-${color}/10 text-${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className={`text-2xl font-bold tracking-tight ${color ? `text-${color}` : ''}`}>
          {value}
        </h3>
      </div>

    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Calendar,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetTradesQuery } from "@/features/trades/tradesApi";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { memo, useMemo } from "react";

interface DailySummary {
  date: string;
  profit: number;
  loss: number;
  net: number;
  count: number;
  wins: number;
  losses: number;
  notes: string[];
}

// 1. Defined outside to prevent unmounting on every parent render
const DayWithTooltip = memo(({
  day,
  className,
  summary,
  ...props
}: {
  day: { date: Date };
  className?: string;
  summary?: DailySummary;
  [key: string]: unknown;
}) => {
  if (!summary) {
    return (
      <button
        className={cn(
          "h-10 w-10 p-0 font-medium text-xs aria-selected:opacity-100 items-center justify-center flex hover:bg-accent rounded-xl transition-all",
          className
        )}
        {...props}
      />
    );
  }

  const net = summary.net;
  const isProfit = net > 0;
  const isLoss = net < 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-10 w-10 p-0 font-black text-xs aria-selected:opacity-100 items-center justify-center flex rounded-xl transition-all relative border border-transparent shadow-sm hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-primary outline-none",
            isProfit ? "bg-profit/10 text-profit hover:bg-profit/20 border-profit/20" :
              isLoss ? "bg-loss/10 text-loss hover:bg-loss/20 border-loss/20" :
                "bg-accent/50 text-muted-foreground",
            className
          )}
          {...props}
        >
          {day.date.getDate()}
          <div className={cn(
            "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-sm ring-1 ring-background",
            isProfit ? "bg-profit" : isLoss ? "bg-loss" : "bg-muted-foreground"
          )} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        className="p-0 bg-transparent border-none shadow-none z-[1002] w-[calc(100vw-40px)] sm:w-auto"
      >
        <div className="p-6 bg-card border border-border shadow-2xl rounded-[1.5rem] min-w-0 sm:min-w-[260px] w-full backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter">{format(day.date, "MMMM dd")}</span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">{format(day.date, "EEEE")}</span>
            </div>
            <div className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
              isProfit ? "bg-profit/20 text-profit ring-1 ring-profit/30" :
                isLoss ? "bg-loss/20 text-loss ring-1 ring-loss/30" :
                  "bg-accent text-muted-foreground"
            )}>
              {isProfit ? "WINNER" : isLoss ? "LOSER" : "FLAT"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  {isProfit ? <TrendingUp className="w-4 h-4 text-profit" /> : <TrendingDown className="w-4 h-4 text-loss" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Net Surplus</span>
                </div>
                <span className={cn("text-sm font-black italic", isProfit ? "text-profit" : isLoss ? "text-loss" : "")}>
                  {net >= 0 ? "+" : ""}${net.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-background/50 rounded-full overflow-hidden flex">
                <div
                  className={cn("h-full", isProfit ? "bg-profit" : "bg-loss")}
                  style={{ width: `${Math.min(100, (Math.abs(net) / 5000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-profit/5 p-3 rounded-2xl border border-profit/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-profit/70 uppercase tracking-widest">Earnings</span>
                  <div className="px-1.5 py-0.5 rounded bg-profit/10 text-profit text-[9px] font-black">{summary.wins}W</div>
                </div>
                <div className="text-xl font-black text-profit tracking-tighter">
                  ${summary.profit.toLocaleString()}
                </div>
              </div>

              <div className="bg-loss/5 p-3 rounded-2xl border border-loss/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-loss/70 uppercase tracking-widest">Drawdown</span>
                  <div className="px-1.5 py-0.5 rounded bg-loss/10 text-loss text-[9px] font-black">{summary.losses}L</div>
                </div>
                <div className="text-xl font-black text-loss tracking-tighter">
                  -${summary.loss.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-2">
              <div className="px-3 py-1 rounded-full bg-muted flex items-center space-x-2 border border-border/50">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {summary.count} Total Trades Today
                </span>
              </div>
            </div>

            {summary.notes.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aggregate Notes</span>
                </div>
                <div className="space-y-2">
                  {summary.notes.slice(0, 3).map((note, idx) => (
                    <p key={idx} className="text-[11px] text-muted-foreground leading-relaxed font-bold italic line-clamp-1 border-l-2 border-primary/20 pl-2">
                      &quot;{note}&quot;
                    </p>
                  ))}
                  {summary.notes.length > 3 && (
                    <p className="text-[9px] text-primary/60 font-black">+{summary.notes.length - 3} MORE ENTRIES</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DayWithTooltip.displayName = "DayWithTooltip";

export function TradingCalendar() {
  const { data: trades = [], isLoading } = useGetTradesQuery(undefined);

  const dailyDataMap = useMemo(() => {
    const map: Record<string, DailySummary> = {};
    if (Array.isArray(trades)) {
      trades.forEach((trade: { date: string; profit: string | number; loss: string | number; notes?: string }) => {
        const dateKey = trade.date.split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = {
            date: dateKey,
            profit: 0,
            loss: 0,
            net: 0,
            count: 0,
            wins: 0,
            losses: 0,
            notes: []
          };
        }
        const p = typeof trade.profit === 'string' ? parseFloat(trade.profit) : (Number(trade.profit) || 0);
        const l = typeof trade.loss === 'string' ? parseFloat(trade.loss) : (Number(trade.loss) || 0);
        map[dateKey].profit += p;
        map[dateKey].loss += l;
        map[dateKey].net += (p - l);
        map[dateKey].count += 1;
        if (p > 0) map[dateKey].wins += 1;
        if (l > 0) map[dateKey].losses += 1;
        if (trade.notes) map[dateKey].notes.push(trade.notes);
      });
    }
    return map;
  }, [trades]);

  // 2. Memoize components to ensure react-day-picker doesn't think the component type changed
  const calendarComponents = useMemo(() => ({
    DayButton: ({ day, className, ...props }: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const dateKey = format(day.date, "yyyy-MM-dd");
      return (
        <DayWithTooltip
          day={day}
          className={className}
          summary={dailyDataMap[dateKey]}
          {...props}
        />
      );
    }
  }), [dailyDataMap]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-border bg-accent/30 hover:bg-accent/50 transition-all flex items-center space-x-2 cursor-pointer shadow-sm active:scale-95"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <CalendarIcon className="w-4 h-4 text-primary" />}
          <span className="hidden md:inline font-bold text-xs tracking-tight uppercase">Performance Calendar</span>
          <span className="md:hidden text-xs font-bold uppercase">Calendar</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-32px)] sm:w-auto p-0 border-border bg-card shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl z-[1001]" align="center" sideOffset={8}>
        <div className="p-4 border-b border-border bg-accent/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest opacity-70">Daily Sync</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-black">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-profit" />
              <span className="text-profit">WIN</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-loss" />
              <span className="text-loss">LOSS</span>
            </div>
          </div>
        </div>
        <Calendar
          mode="single"
          className="p-3"
          components={calendarComponents}
        />
      </PopoverContent>
    </Popover>
  );
}

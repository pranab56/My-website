"use client";

import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetTradesQuery } from '@/features/trades/tradesApi';
import { cn } from '@/lib/utils';
import { addDays, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  History,
  Info,
  Lightbulb,
  Percent,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import Loading from '../../components/Loading/Loading';

// --- Types ---
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

interface MonthlyStats {
  totalProfit: number;
  totalLoss: number;
  netResult: number;
  winningDays: number;
  losingDays: number;
  totalTrades: number;
  winRate: number;
  bestDay: number;
  worstDay: number;
}

// --- Data & Helpers ---
const MOTIVATIONAL_TIPS = [
  "Losses are the tuition for your trading education. Study them well.",
  "Your job is not to make money, but to execute your plan perfectly.",
  "The market doesn't care about your feelings. Stay objective.",
  "Risk management is the only holy grail in trading.",
  "A single trade shouldn't define your emotional state or your account.",
  "Consistency in process leads to consistency in results.",
  "The goal of a successful trader is to make the best trades, not the most money.",
  "Patience is the ability to wait for your edge to manifest."
];

const DISCIPLINE_ALERTS = [
  "Breathe. A loss is just information. Don't revenge trade.",
  "Stop trading for today. Protect your remaining capital.",
  "Review your entries. Were you following your strategy?",
  "Market conditions might be unfavorable for your edge. Step back.",
  "Discipline is doing what needs to be done, even when you don't feel like it."
];

// --- Sub-components ---

const DayButton = memo(({
  day,
  className,
  summary,
  threshold = 1000,
  ...props
}: {
  day: { date: Date };
  className?: string;
  summary?: DailySummary;
  threshold?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  if (!summary) {
    return (
      <button
        className={cn(
          "h-full w-full p-1 sm:p-2 font-medium text-xs text-center flex flex-col items-center justify-start hover:bg-accent/50 rounded-lg sm:rounded-xl transition-all border border-transparent min-h-[50px] sm:min-h-[80px]",
          className
        )}
        {...props}
      >
        <span className="self-end opacity-40">{day.date.getDate()}</span>
      </button>
    );
  }

  const net = summary.net;
  const isProfit = net > 0;
  const isLoss = net < 0;
  const isHeavyLoss = isLoss && Math.abs(net) >= threshold;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-full w-full p-1 sm:p-2 font-black text-xs flex flex-col items-center justify-between rounded-lg sm:rounded-xl transition-all relative border shadow-sm hover:scale-[1.02] active:scale-95 outline-none min-h-[50px] sm:min-h-[80px]",
            isProfit ? "bg-profit/10 text-profit border-profit/20 hover:bg-profit/20" :
              isLoss ? "bg-loss/10 text-loss border-loss/20 hover:bg-loss/20" :
                "bg-accent/50 text-muted-foreground border-border",
            className
          )}
          {...props}
        >
          <div className="flex justify-between w-full items-start">
            <div className={cn(
              "p-0.5 sm:p-1 rounded-md mb-1 sm:mb-2",
              isProfit ? "bg-profit text-white" : isLoss ? "bg-loss text-white" : "bg-muted"
            )}>
              {isProfit ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 h-3" /> : isLoss ? <TrendingDown className="w-2.5 h-2.5 sm:w-3 h-3" /> : <Zap className="w-2.5 h-2.5 sm:w-3 h-3" />}
            </div>
            <span className="opacity-60 text-[8px] sm:text-xs">{day.date.getDate()}</span>
          </div>

          <div className="flex flex-col items-center w-full mt-auto">
            <span className="text-[8px] md:text-[10px] font-black tracking-tighter truncate w-full">
              {net >= 0 ? "+" : ""}${Math.abs(net).toLocaleString()}
            </span>
            <div className="hidden sm:flex space-x-0.5 mt-1">
              {Array.from({ length: Math.min(summary.count, 3) }).map((_, i) => (
                <div key={i} className={cn("w-1 h-1 rounded-full", isProfit ? "bg-profit" : isLoss ? "bg-loss" : "bg-muted-foreground")} />
              ))}
              {summary.count > 3 && <span className="text-[8px] leading-none">+</span>}
            </div>
          </div>

          {isHeavyLoss && (
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-loss opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-loss"></span>
              </span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" className="p-0 border-none bg-transparent shadow-none w-[calc(100vw-32px)] sm:w-80 z-50">
        <div className="bg-card border border-border shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-300">
          <div className={cn(
            "p-6 flex flex-col",
            isProfit ? "bg-profit/5" : isLoss ? "bg-loss/5" : "bg-accent/5"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black tracking-tighter">{format(day.date, "EEEE")}</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{format(day.date, "MMMM dd, yyyy")}</p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                isProfit ? "bg-profit text-white shadow-profit/20" : isLoss ? "bg-loss text-white shadow-loss/20" : "bg-accent text-muted-foreground"
              )}>
                {isProfit ? <ArrowUpRight className="w-6 h-6" /> : isLoss ? <ArrowDownRight className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background/80 p-4 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Gross Profit</p>
                <p className="text-xl font-black text-profit">${summary.profit.toLocaleString()}</p>
              </div>
              <div className="bg-background/80 p-4 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Gross Loss</p>
                <p className="text-xl font-black text-loss">-${summary.loss.toLocaleString()}</p>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-2xl border mb-6",
              isProfit ? "bg-profit/10 border-profit/20 text-profit" : "bg-loss/10 border-loss/20 text-loss"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest leading-none">Net Daily P/L</span>
                <span className="text-2xl font-black">{net >= 0 ? "+" : "-"}${Math.abs(net).toLocaleString()}</span>
              </div>
            </div>

            {isLoss && (
              <div className="bg-loss/5 border border-loss/20 rounded-2xl p-4 flex gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-loss shrink-0" />
                <p className="text-xs font-medium italic text-loss leading-relaxed line-clamp-2">
                  {isHeavyLoss ? DISCIPLINE_ALERTS[Math.floor(Math.random() * DISCIPLINE_ALERTS.length)] : "Stick to the plan. Every trade is just one of many."}
                </p>
              </div>
            )}

            {isProfit && (
              <div className="bg-profit/5 border border-profit/20 rounded-2xl p-4 flex gap-3">
                <Trophy className="w-5 h-5 text-profit shrink-0" />
                <p className="text-xs font-medium italic text-profit leading-relaxed">
                  Excellent discipline. Remember: market doesn&apos;t owe you anything for yesterday&apos;s win.
                </p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

DayButton.displayName = "DayButton";

// --- Main Page Component ---
export default function TradingCalendarPage() {
  const { data: trades = [], isLoading } = useGetTradesQuery(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [lossThreshold] = useState(500); // Alert when day loss > 500

  // 1. Process trade data into daily summaries
  const dailyDataMap = useMemo(() => {
    const map: Record<string, DailySummary> = {};
    if (Array.isArray(trades)) {
      trades.forEach((trade: { date: string; profit: string; loss: string; notes?: string }) => {
        const dateKey = format(parseISO(trade.date), "yyyy-MM-dd");
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
        const p = parseFloat(trade.profit) || 0;
        const l = parseFloat(trade.loss) || 0;
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

  // 2. Calculate monthly statistics based on currentMonth
  const monthlyStats = useMemo((): MonthlyStats => {
    const stats: MonthlyStats = {
      totalProfit: 0,
      totalLoss: 0,
      netResult: 0,
      winningDays: 0,
      losingDays: 0,
      totalTrades: 0,
      winRate: 0,
      bestDay: 0,
      worstDay: 0
    };


    Object.values(dailyDataMap).forEach(summary => {
      const summaryDate = parseISO(summary.date);
      if (isSameMonth(summaryDate, currentMonth)) {
        stats.totalProfit += summary.profit;
        stats.totalLoss += summary.loss;
        stats.netResult += summary.net;
        stats.totalTrades += summary.count;

        if (summary.net > 0) stats.winningDays += 1;
        else if (summary.net < 0) stats.losingDays += 1;

        if (summary.net > stats.bestDay) stats.bestDay = summary.net;
        if (summary.net < stats.worstDay) stats.worstDay = summary.net;
      }
    });

    const totalDays = stats.winningDays + stats.losingDays;
    stats.winRate = totalDays > 0 ? (stats.winningDays / totalDays) * 100 : 0;

    return stats;
  }, [dailyDataMap, currentMonth]);

  const randomTip = MOTIVATIONAL_TIPS[Math.floor((currentMonth.getMonth() + currentMonth.getDate()) % MOTIVATIONAL_TIPS.length)];

  return (
    <MainLayout>
      {
        isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6 md:space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Trading Progress</h1>
                <p className="text-sm text-muted-foreground flex items-center font-normal">
                  <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                  Visualizing your performance delta across time.
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3 bg-card border border-border p-1.5 md:p-2 rounded-2xl shadow-sm shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-9 w-9 md:h-10 md:w-10 cursor-pointer"
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <div className="px-3 md:px-6 py-1.5 md:py-2 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-xs md:text-sm font-bold text-primary whitespace-nowrap">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-9 w-9 md:h-10 md:w-10 cursor-pointer"
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>

            {/* Motivation/Psychology Tip */}
            <div className="bg-primary/5 border border-primary/10 p-4 md:p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-primary" />
              <div className="flex items-start gap-3 md:gap-4 relative z-10">
                <div className="p-2.5 md:p-3 bg-primary/10 rounded-2xl text-primary shrink-0 transition-transform group-hover:scale-110">
                  <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] md:text-xs font-black text-primary/70 uppercase tracking-widest">Psychology Tip</h4>
                  <p className="text-sm md:text-lg font-black italic tracking-tight opacity-90 leading-snug">
                    &quot;{randomTip}&quot;
                  </p>
                </div>
              </div>
              <Zap className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-16 md:w-24 h-16 md:h-24 text-primary/5 -rotate-12 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {/* Calendar Section (L) */}
              <Card className="lg:col-span-2 xl:col-span-3 border-border bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 md:p-8 border-b border-border/50 flex flex-col sm:flex-row items-center justify-between bg-accent/5 gap-4">
                  <div className="flex items-center space-x-3 self-start sm:self-auto">
                    <div className="p-2 bg-primary rounded-xl text-white">
                      <History className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight">Activity Blueprint</h3>
                  </div>
                  <div className="flex items-center space-x-4 md:space-x-6 shrink-0 bg-background/50 p-2 md:p-0 rounded-xl md:bg-transparent border border-border md:border-none w-full sm:w-auto justify-center sm:justify-end">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-profit shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-xs md:text-sm font-bold text-profit">Profit Edge</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-loss shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                      <span className="text-xs md:text-sm font-bold text-loss">Drawdown</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-8 w-full">
                  {/* Custom Calendar Grid */}
                  <div className="w-full h-full">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-4">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] text-center py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                      {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(currentMonth);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);

                        const calendarDays = [];
                        let day = startDate;

                        while (day <= endDate) {
                          calendarDays.push(day);
                          day = addDays(day, 1);
                        }

                        return calendarDays.map((date) => {
                          const dateKey = format(date, "yyyy-MM-dd");
                          const isCurrentMonth = isSameMonth(date, monthStart);

                          return (
                            <div key={dateKey} className="aspect-square relative">
                              <DayButton
                                day={{ date }}
                                className={cn(
                                  "w-full h-full",
                                  !isCurrentMonth && "opacity-20 pointer-events-none"
                                )}
                                summary={dailyDataMap[dateKey]}
                                threshold={lossThreshold}
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats & Summary (R) */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-6 md:space-y-8">
                <Card className="border-border bg-card/50 rounded-2xl overflow-hidden shadow-lg border border-primary/10 p-0">
                  <div className="p-6 border-b border-border/50 bg-primary/5">
                    <h4 className="text-sm font-bold text-primary flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Monthly Summary
                    </h4>
                  </div>
                  <CardContent className="px-4 py-3 space-y-6">
                    <div>
                      <p className="text-sm font-semibold mb-3">Net Performance</p>
                      <div className={cn(
                        "text-4xl font-black italic tracking-tighter",
                        monthlyStats.netResult >= 0 ? "text-profit" : "text-loss"
                      )}>
                        {monthlyStats.netResult >= 0 ? "+" : "-"}${Math.abs(monthlyStats.netResult).toLocaleString()}
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        Overall {monthlyStats.netResult >= 0 ? "Profit" : "Loss"} for this cycle
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Growth</p>
                          <p className="text-lg font-black text-profit">+${monthlyStats.totalProfit.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Burn</p>
                          <p className="text-lg font-black text-loss">-${monthlyStats.totalLoss.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-accent/50 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          className="h-full bg-profit transition-all duration-700"
                          style={{ width: `${(monthlyStats.totalProfit / (monthlyStats.totalProfit + monthlyStats.totalLoss || 1)) * 100}%` }}
                        />
                        <div className="h-full bg-loss" style={{ flex: 1 }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-accent/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Win Rate</p>
                        <div className="flex items-center space-x-2">
                          <Percent className="w-4 h-4 text-profit" />
                          <span className="text-xl font-black">{monthlyStats.winRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="bg-accent/30 p-4 rounded-2xl border border-border/50">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Trades</p>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-xl font-black">{monthlyStats.totalTrades}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="bg-profit/5 border border-profit/20 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-profit/80 uppercase">Best Day</p>
                      <p className="text-xl font-black text-profit">${monthlyStats.bestDay.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-profit opacity-20" />
                  </div>

                  <div className="bg-loss/5 border border-loss/20 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-loss/80 uppercase">Worst Day</p>
                      <p className="text-xl font-black text-loss">${Math.abs(monthlyStats.worstDay).toLocaleString()}</p>
                    </div>
                    <ArrowDownRight className="w-8 h-8 text-loss opacity-20" />
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-3xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm uppercase tracking-widest">Consistency Target</h5>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Aim for 3 consecutive green days to unlock Next-Level badges.</p>
                    </div>
                    <Button className="w-full rounded-xl h-12 font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-2xl shadow-primary/20 transition-transform active:scale-95 cursor-pointer">
                      View Achievement Vault
                    </Button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                </Card>
              </div>
            </div>
          </div>
        )
      }
    </MainLayout>
  );
}

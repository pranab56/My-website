"use client";

import TradeCountBarChart from '@/components/charts/TradeCountBarChart';
import WinLossPieChart from '@/components/charts/WinLossPieChart';
import MainLayout from '@/components/layout/MainLayout';
import { useGetAnalyticsQuery } from '@/features/trades/tradesApi';
import {
  Activity,
  AlertCircle,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Trophy
} from 'lucide-react';
import Loading from '../../components/Loading/Loading';

export default function AnalyticsPage() {
  const { data, error, isLoading } = useGetAnalyticsQuery(undefined);


  if (error) return (
    <div className="flex items-center justify-center h-[calc(100vh-120px)] text-destructive font-medium">
      Failed to load analytics records.
    </div>
  );

  const totalWins = data?.totalWins || 0;
  const totalLosses = data?.totalLosses || 0;
  const chartData = data?.chartData || [];

  return (
    <MainLayout>
      {
        isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6 md:space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Advanced Metrics</h1>
                <p className="text-sm text-muted-foreground">Deep dive into your isolated trading database intelligence.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-1 bg-card border border-border p-6 md:p-6 rounded-2xl flex flex-col items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                <div className="flex items-center space-x-3 self-start mb-6 md:mb-8 relative z-10">
                  <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Outcome Distribution</h3>
                </div>

                <div className="w-full max-w-[280px] mx-auto">
                  <WinLossPieChart wins={totalWins} losses={totalLosses} />
                </div>

                <div className="mt-6 md:mt-8 grid grid-cols-2 gap-4 md:gap-8 w-full relative z-10">
                  <div className="text-center p-3 md:p-4 bg-profit/5 rounded-2xl border border-profit/10">
                    <p className="text-[10px] text-profit font-black mb-1 uppercase tracking-widest">Wins</p>
                    <p className="text-2xl md:text-3xl font-black text-profit">{totalWins}</p>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-loss/5 rounded-2xl border border-loss/10">
                    <p className="text-[10px] text-loss font-black mb-1 uppercase tracking-widest">Losses</p>
                    <p className="text-2xl md:text-3xl font-black text-loss">{totalLosses}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-card border border-border p-6 md:p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 relative z-10 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <BarChartIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Activity Log Volume</h3>
                  </div>
                  <div className="bg-muted px-4 py-1.5 rounded-full self-start sm:self-auto">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{chartData.length} Sample Points</span>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <TradeCountBarChart data={chartData} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-gradient-to-br from-green-500/10 via-background to-primary/5 border border-green-500/20 p-5 md:p-8 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-4 mb-6 md:mb-8">
                  <div className="p-3 md:p-3.5 rounded-2xl bg-green-500 text-white shadow-xl shadow-green-500/20 shrink-0">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold tracking-tight">Consistency Insights</h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">Growth Identifiers</p>
                  </div>
                </div>
                <div className="space-y-4 md:space-y-5">
                  <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
                    <div className="w-2 h-8 md:h-10 rounded-full bg-green-500 shrink-0" />
                    <div>
                      <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Win Rate Performance</p>
                      <p className="text-xs md:text-sm font-bold italic">Currently {data?.winRate?.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
                    <div className="w-2 h-8 md:h-10 rounded-full bg-green-500 shrink-0" />
                    <div>
                      <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Profit Streak</p>
                      <p className="text-xs md:text-sm font-bold italic">Best run: {data?.winningStreak} logs.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 via-background to-primary/5 border border-red-500/20 p-5 md:p-8 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-4 mb-6 md:mb-8">
                  <div className="p-3 md:p-3.5 rounded-2xl bg-red-500 text-white shadow-xl shadow-red-500/20 shrink-0">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold tracking-tight">Risk Exposure Alert</h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">Drawdown Analysis</p>
                  </div>
                </div>
                <div className="space-y-4 md:space-y-5">
                  <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
                    <div className="w-2 h-8 md:h-10 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Capital Exposure</p>
                      <p className="text-xs md:text-sm font-bold italic text-loss">Max drawdown: ${data?.maxDrawdown?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border">
                    <div className="w-2 h-8 md:h-10 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Average Risk Cost</p>
                      <p className="text-xs md:text-sm font-bold italic text-loss">Avg cost/loss: ${data?.avgLoss?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Row: Profit Factor & Expectancy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-card border border-border p-5 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2.5 md:p-3 rounded-2xl bg-primary/10 text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold tracking-tight">Profit Factor</h4>
                </div>
                <p className="text-2xl md:text-3xl font-black mb-2">{data?.profitFactor?.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Gross Profit / Gross Loss • {data?.profitFactor >= 1 ? 'Positive' : 'Imbalance'}</p>
              </div>

              <div className="bg-card border border-border p-5 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2.5 md:p-3 rounded-2xl bg-primary/10 text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold tracking-tight">Trading Expectancy</h4>
                </div>
                <p className="text-2xl md:text-3xl font-black mb-2">${data?.expectancy?.toFixed(2)}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Estimated value per trade based on historical edge</p>
              </div>
            </div>
          </div>
        )
      }
    </MainLayout>
  );
}

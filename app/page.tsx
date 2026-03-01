"use client";

import EquityCurveChart from '@/components/charts/EquityCurveChart';
import ProfitLossChart from '@/components/charts/ProfitLossChart';
import KPICard from '@/components/dashboard/KPICard';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAnalyticsQuery } from '@/features/trades/tradesApi';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Percent,
  Target,
  TrendingUp,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Loading from '../components/Loading/Loading';

export default function OverviewPage() {
  const [localToday, setLocalToday] = useState<string>('');
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    setLocalToday(localDate.toISOString().split('T')[0]);
  }, []);

  const { data, error, isLoading } = useGetAnalyticsQuery(localToday, { skip: !localToday });

  const filteredChartData = (() => {
    if (!data?.chartData) return [];

    // Sort chart data by date
    const sortedData = [...data.chartData].sort((a, b) => a.date.localeCompare(b.date));

    if (activeTab === 'daily') {
      // Show last 30 daily entries to provide a visible trend
      return sortedData.slice(-30);
    }
    if (activeTab === 'monthly') {
      // Show last 90 days for monthly trend
      return sortedData.slice(-90);
    }
    if (activeTab === 'yearly') {
      // Show all data points for yearly overview
      return sortedData;
    }
    return sortedData;
  })();

  if (error) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-destructive space-y-4">
        <Activity className="w-12 h-12 opacity-50" />
        <p className="font-bold">Failed to load analytics records.</p>
        <button onClick={() => window.location.reload()} className="text-primary underline">Try again</button>
      </div>
    </MainLayout>
  );

  const formatCurrency = (val: number) => {
    return `${val >= 0 ? '+' : '-'}$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <MainLayout>
      {isLoading ? (
        <div className="col-span-full">
          <Loading />
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Trading Performance</h1>
              <p className="text-sm text-muted-foreground max-w-md">Comprehensive analysis of your capital and growth strategies.</p>
            </div>
            <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-2xl">
              <Wallet className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Initial Capital</span>
                <span className="font-bold leading-tight">${(data?.initialCapital || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Global Capital Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border bg-card/50 backdrop-blur-sm rounded-3xl p-5 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading">Equity Curve</h3>
                    <p className="text-xs text-muted-foreground">Cumulative growth for selected period</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Growth</p>
                  <p className={`text-lg md:text-xl font-black ${(data?.capitalGrowthPercent || 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {(data?.capitalGrowthPercent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="h-[250px] md:h-[300px]">
                <EquityCurveChart data={filteredChartData} />
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <KPICard
                title="Current Capital"
                value={`$${(data?.currentCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={Wallet}
                color="primary"
              />
              <KPICard
                title="Total Net PnL"
                value={formatCurrency(data?.totalPnL || 0)}
                icon={Activity}
                color={(data?.totalPnL || 0) >= 0 ? 'profit' : 'loss'}
              />
              <Card className="bg-primary p-6 rounded-3xl text-primary-foreground shadow-xl shadow-primary/20 flex flex-col justify-between overflow-hidden relative border-none sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">Portfolio Stats</h4>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between text-xs font-medium border-b border-primary-foreground/10 pb-2">
                      <span>Profit Factor</span>
                      <span className="font-bold">{data?.allTime?.profitFactor?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium border-b border-primary-foreground/10 pb-2">
                      <span>Expectancy</span>
                      <span className="font-bold">{formatCurrency(data?.allTime?.expectancy || 0)}/trade</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>Win Rate</span>
                      <span className="font-bold">{data?.allTime?.winRate?.toFixed(1) || '0'}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Time Period Analysis */}
          <div className="space-y-6">
            <Tabs defaultValue="daily" onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  < BarChart3 className="w-5 h-5 text-primary" />
                  Performance
                </h2>
                <TabsList className="bg-card border border-border p-1 rounded-xl h-auto flex-wrap sm:flex-nowrap">
                  <TabsTrigger value="daily" className="flex-1 sm:flex-none rounded-lg py-2 px-3 md:px-4 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Daily</TabsTrigger>
                  <TabsTrigger value="monthly" className="flex-1 sm:flex-none rounded-lg py-2 px-3 md:px-4 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="flex-1 sm:flex-none rounded-lg py-2 px-3 md:px-4 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Yearly</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="daily" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Day Profit"
                    value={formatCurrency(data?.today?.profit || 0)}
                    icon={ArrowUpRight}
                    color="profit"
                  />
                  <KPICard
                    title="Day Loss"
                    value={formatCurrency(-(data?.today?.loss || 0))}
                    icon={ArrowDownRight}
                    color="loss"
                  />
                  <KPICard
                    title="Day Win Rate"
                    value={`${data?.today?.winRate?.toFixed(1) || 0}%`}
                    icon={Percent}
                    color="profit"
                  />
                  <KPICard
                    title="Day Risk-Reward"
                    value={data?.today?.avgRR || '0:0'}
                    icon={Target}
                    color="primary"
                  />
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Monthly Net"
                    value={formatCurrency(data?.monthly?.net || 0)}
                    icon={Calendar}
                    color={(data?.monthly?.net || 0) >= 0 ? 'profit' : 'loss'}
                  />
                  <KPICard
                    title="Monthly ROI"
                    value={`${(data?.monthly?.roi || 0).toFixed(2)}%`}
                    icon={Percent}
                    color={(data?.monthly?.roi || 0) >= 0 ? 'profit' : 'loss'}
                  />
                  <KPICard
                    title="Monthly Growth"
                    value={`$${(data?.monthly?.growth || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="primary"
                  />
                  <KPICard
                    title="Monthly Win Rate"
                    value={`${data?.monthly?.winRate?.toFixed(1) || 0}%`}
                    icon={Percent}
                    color="profit"
                  />
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Yearly ROI"
                    value={`${(data?.yearly?.roi || 0).toFixed(2)}%`}
                    icon={Percent}
                    color={(data?.yearly?.roi || 0) >= 0 ? 'profit' : 'loss'}
                  />
                  <KPICard
                    title="Max Drawdown"
                    value={formatCurrency(-(data?.yearly?.maxDrawdown || 0))}
                    icon={ArrowDownRight}
                    color="loss"
                  />
                  <KPICard
                    title="Best Month"
                    value={data?.yearly?.bestMonth || 'N/A'}
                    icon={Calendar}
                    color="profit"
                  />
                  <KPICard
                    title="Worst Month"
                    value={data?.yearly?.worstMonth || 'N/A'}
                    icon={Calendar}
                    color="loss"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Profit/Loss Chart */}
          <Card className="border-border bg-card/50 backdrop-blur-sm rounded-3xl p-5 md:p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className={`p-2 rounded-xl transition-colors ${filteredChartData.reduce((acc: number, i: { net?: number }) => acc + (i.net || 0), 0) >= 0 ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading">PnL Distribution</h3>
                <p className="text-xs text-muted-foreground">Realized metrics for {activeTab}</p>
              </div>
            </div>
            <div className="h-[250px] md:h-[300px]">
              <ProfitLossChart data={filteredChartData} />
            </div>
          </Card>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/trades" className="group">
              <Card className="p-6 bg-card/50 border-border rounded-3xl group-hover:bg-primary/5 transition-colors cursor-pointer border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Trade Journal</h4>
                      <p className="text-sm text-muted-foreground">View and manage individual trades</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </Card>
            </Link>

            <Link href="/analytics" className="group">
              <Card className="p-6 bg-card/50 border-border rounded-3xl group-hover:bg-primary/5 transition-colors cursor-pointer border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Advanced Analytics</h4>
                      <p className="text-sm text-muted-foreground">Detailed psychological and risk insights</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </MainLayout>

  );
}

"use client";

import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTradesQuery } from '@/features/trades/tradesApi';
import { format } from 'date-fns';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface TradeRecord {
  _id: string;
  date: string;
  profit?: number;
  loss?: number;
  riskRewardRatio?: string;
  notes?: string;
  tags?: string[];
}

export default function ReportsPage() {
  const { data: records = [], isLoading } = useGetTradesQuery(undefined);
  const [range, setRange] = useState('all');

  const filteredRecords = useMemo(() => {
    if (range === 'all') return records;

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return records.filter((r: TradeRecord) => {
      const tradeDate = new Date(r.date);
      if (range === '30days') return tradeDate >= thirtyDaysAgo;
      if (range === 'thismonth') return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
      if (range === 'thisyear') return tradeDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [records, range]);

  const exportToCSV = () => {
    if (!filteredRecords || filteredRecords.length === 0) return;

    const headers = ["Date", "Profit", "Loss", "Net Profit", "RR Ratio", "Notes", "Tags"];
    const rows = (filteredRecords as TradeRecord[]).map((r: TradeRecord) => [
      format(new Date(r.date), 'yyyy-MM-dd'),
      r.profit,
      r.loss,
      (r.profit || 0) - (r.loss || 0),
      r.riskRewardRatio,
      `"${r.notes?.replace(/"/g, '""')}"`,
      `"${r.tags?.join(', ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map((e: (string | number | undefined)[]) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TradeLog_Report_${range}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-xl font-semibold mb-1">Reports & Data Factory</h1>
          <p className="text-sm font-normal">Extract your isolated trading intelligence for external synthesis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-card border border-border p-6 md:p-10 rounded-xl flex flex-col items-center text-center shadow-sm hover:shadow-primary/5 transition-all">
            <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-8 animate-pulse">
              <FileSpreadsheet className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Legacy CSV Export</h3>
            <p className="text-muted-foreground mb-6 md:mb-10 text-sm max-w-[280px] font-medium leading-relaxed">
              Generate a raw data blueprint of {range === 'all' ? 'every single record' : `records from ${range}`} in your isolated database.
            </p>
            <Button
              onClick={exportToCSV}
              disabled={isLoading || filteredRecords.length === 0}
              className="w-full h-auto py-5 rounded font-semibold tracking-widest bg-primary text-primary-foreground shadow-2xl shadow-primary/20 flex items-center justify-center space-x-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-6 h-6" />}
              <span>Download .CSV Data</span>
            </Button>
            {filteredRecords.length === 0 && !isLoading && (
              <p className="text-[10px]  font-normal text-sm mt-4">No records found for this range</p>
            )}
          </div>

          <div className="bg-card border border-border p-6 md:p-10 rounded-xl flex flex-col items-center text-center opacity-40 grayscale">
            <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center text-muted-foreground mb-8">
              <FileText className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Enterprise PDF</h3>
            <p className="text-muted-foreground mb-6 md:mb-10 text-sm max-w-[280px] font-medium leading-relaxed">
              Create a visualized performance audit for investors or personal reviews.
            </p>
            <Button disabled className="w-full py-5 rounded-2xl font-semibold tracking-widest bg-muted text-muted-foreground cursor-not-allowed h-auto">
              Vault Locked
            </Button>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 p-6 md:p-10 rounded-xl shadow-xl">
          <div className="flex items-center space-x-4 mb-6 md:mb-8">
            <div className="p-2 bg-primary rounded-lg text-white">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-xl">Factory Filters</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-semibold ml-1">Temporal Range</label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-full bg-card border-border px-6 h-auto py-5 rounded text-sm font-semibold focus:ring-primary/20 cursor-pointer shadow-sm">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded">
                  <SelectItem value="all">ALL TIME HORIZON</SelectItem>
                  <SelectItem value="30days">LAST 30 CYCLES</SelectItem>
                  <SelectItem value="thismonth">CURRENT MONTH</SelectItem>
                  <SelectItem value="thisyear">FISCAL YEAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-semibold ml-1">Contextual Tags</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full bg-card border-border px-6 h-auto rounded py-5 text-sm font-semibold focus:ring-primary/20 cursor-pointer shadow-sm">
                  <SelectValue placeholder="Select Tags" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded">
                  <SelectItem value="all">EVERY TAG MATCH</SelectItem>
                  <SelectItem value="scalp">SCALPING ONLY</SelectItem>
                  <SelectItem value="swing">SWING ONLY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

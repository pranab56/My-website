"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const PROFIT_COLOR = "#4CAF50";
const LOSS_COLOR = "#F44336";
const NEUTRAL_COLOR = "#888888";
const CARD_BG_LIGHT = "#FFFFFF";
const CARD_BG_DARK = "#1E1E1E";

interface ProfitLossChartProps {
  data: { date: string; net: number }[];
}

export default function ProfitLossChart({ data }: ProfitLossChartProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const totalPnL = data.reduce((acc, item) => acc + (item.net || 0), 0);
  const isPositive = totalPnL >= 0;
  const isNegative = totalPnL < 0;

  const chartColor = isPositive ? PROFIT_COLOR : LOSS_COLOR;
  const cardBg = isDark ? CARD_BG_DARK : CARD_BG_LIGHT;

  if (!mounted) return <div className="h-[300px] w-full" />;

  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#444444" : "#DDDDDD"} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartColor, fontSize: 10, opacity: 0.7 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartColor, fontSize: 10, opacity: 0.7 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: cardBg,
              borderColor: chartColor,
              borderRadius: '12px',
              fontSize: '12px',
              color: chartColor
            }}
            itemStyle={{ color: chartColor }}
          />
          <Area
            type="monotone"
            dataKey="net"
            stroke={chartColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorNet)"
            dot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

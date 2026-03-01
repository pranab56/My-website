"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
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

interface TradeCountBarChartProps {
  data: { date: string; totalTrades: number; net?: number }[];
}

export default function TradeCountBarChart({ data }: TradeCountBarChartProps) {
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

  if (!mounted) return <div className="h-[400px] w-full" />;

  return (
    <div className="h-[300px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            cursor={{ fill: isDark ? '#ffffff10' : '#00000010' }}
            contentStyle={{
              backgroundColor: cardBg,
              borderColor: chartColor,
              borderRadius: '12px',
              color: chartColor
            }}
            itemStyle={{ color: chartColor }}
          />
          <Bar
            dataKey="totalTrades"
            fill={chartColor}
            radius={[6, 6, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
const BORDER_LIGHT = "#DDDDDD";
const BORDER_DARK = "#444444";

interface EquityCurveChartProps {
  data: { date: string; equity: number; net?: number }[];
}

export default function EquityCurveChart({ data }: EquityCurveChartProps) {
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
  const borderColor = isDark ? BORDER_DARK : BORDER_LIGHT;

  if (!mounted) return <div className="h-[300px] w-full" />;

  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
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
          <Line
            type="stepAfter"
            dataKey="equity"
            stroke={chartColor}
            strokeWidth={4}
            dot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: chartColor, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

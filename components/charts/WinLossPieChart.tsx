"use client";

import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const PROFIT_COLOR = "#4CAF50";
const LOSS_COLOR = "#F44336";
const CARD_BG_LIGHT = "#FFFFFF";
const CARD_BG_DARK = "#1E1E1E";
const BORDER_LIGHT = "#DDDDDD";
const BORDER_DARK = "#444444";

interface WinLossPieChartProps {
  wins: number;
  losses: number;
}

export default function WinLossPieChart({ wins, losses }: WinLossPieChartProps) {
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

  const data = [
    { name: 'Wins', value: wins, color: PROFIT_COLOR },
    { name: 'Losses', value: losses, color: LOSS_COLOR },
  ];

  if (!mounted) return <div className="h-[300px] w-full" />;

  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? CARD_BG_DARK : CARD_BG_LIGHT,
              borderColor: isDark ? BORDER_DARK : BORDER_LIGHT,
              borderRadius: '12px',
            }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

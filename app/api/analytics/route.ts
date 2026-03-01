import { verifyToken } from '@/lib/auth-utils';
import { getDb, getUserDb } from '@/lib/mongodb-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface TokenPayload {
  email: string;
  dbName: string;
  id: string;
}

interface DailyStats {
  profit: number;
  loss: number;
  count: number;
  wins: number;
  rrValues: number[];
}

interface MonthlyStats {
  profit: number;
  loss: number;
  count: number;
  wins: number;
  year: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientDate = searchParams.get('date'); // Expecting YYYY-MM-DD

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as TokenPayload | null;
    if (!decoded || !decoded.dbName) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const mainDb = await getDb('tradelog_main');
    const user = await mainDb.collection('users').findOne({ email: decoded.email });
    const initialCapital = user?.initialCapital || 0;
    const capitalUpdateDate = user?.capitalUpdateDate ? new Date(user.capitalUpdateDate) : new Date(0);

    const db = await getUserDb(decoded.dbName);
    const rawRecords = await db.collection('trades').find({}).sort({ date: 1 }).toArray();

    // Use current server date if client doesn't provide one
    const todayStr = clientDate || new Date().toISOString().split('T')[0];
    const today = new Date(todayStr); // Parsed as UTC midnight if "YYYY-MM-DD"
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();

    if (rawRecords.length === 0) {
      return NextResponse.json({
        initialCapital,
        currentCapital: initialCapital,
        totalPnL: 0,
        today: { profit: 0, loss: 0, net: 0, winRate: 0, status: 'neutral', avgRR: '0:0' },
        monthly: { profit: 0, loss: 0, net: 0, winRate: 0, roi: 0, growth: initialCapital },
        yearly: { profit: 0, loss: 0, net: 0, winRate: 0, roi: 0, maxDrawdown: 0, bestMonth: null, worstMonth: null },
        allTime: { profitFactor: 0, expectancy: 0, winRate: 0, netProfit: 0 },
        chartData: []
      });
    }

    // Aggregations
    const dailyMap: Record<string, DailyStats> = {};
    const monthlyMap: Record<string, MonthlyStats> = {};

    // Session-specific metrics (from capitalUpdateDate onwards)
    let sessionProfit = 0;
    let sessionLoss = 0;
    let sessionWinCount = 0;
    let sessionTotalCount = 0;
    const sessionRRValues: number[] = [];

    rawRecords.forEach(record => {
      const dateObj = new Date(record.date);
      const isAfterReset = dateObj >= capitalUpdateDate;

      const yearStr = dateObj.getUTCFullYear();
      const monthStr = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const dayStrPart = String(dateObj.getUTCDate()).padStart(2, '0');

      const dayKey = `${yearStr}-${monthStr}-${dayStrPart}`;
      const monthPrefix = `${yearStr}-${monthStr}`;

      const p = parseFloat(record.profit) || 0;
      const l = parseFloat(record.loss) || 0;

      // Update session counters
      if (isAfterReset) {
        sessionProfit += p;
        sessionLoss += l;
        sessionTotalCount++;
        if (p > 0) sessionWinCount++;

        if (record.riskRewardRatio && typeof record.riskRewardRatio === 'string') {
          const parts = record.riskRewardRatio.split(':');
          if (parts.length === 2) {
            sessionRRValues.push(parseFloat(parts[1]) || 0);
          }
        }
      }

      // Daily aggregation (for calendar/tabs - always include)
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { profit: 0, loss: 0, count: 0, wins: 0, rrValues: [] };
      }
      dailyMap[dayKey].profit += p;
      dailyMap[dayKey].loss += l;
      dailyMap[dayKey].count += 1;
      if (p > 0) dailyMap[dayKey].wins += 1;

      // Monthly aggregation (for calendar/tabs - always include)
      if (!monthlyMap[monthPrefix]) {
        monthlyMap[monthPrefix] = { profit: 0, loss: 0, count: 0, wins: 0, year: yearStr };
      }
      monthlyMap[monthPrefix].profit += p;
      monthlyMap[monthPrefix].loss += l;
      monthlyMap[monthPrefix].count += 1;
      if (p > 0) monthlyMap[monthPrefix].wins += 1;
    });

    // Chart Data & Drawdown - ONLY starting from session
    const sortedDayKeys = Object.keys(dailyMap).sort();
    let peak = initialCapital;
    let sessionMaxDrawdown = 0;
    let runningCapital = initialCapital;

    const sessionChartData = sortedDayKeys
      .filter(dayKey => new Date(dayKey) >= capitalUpdateDate)
      .map(dayKey => {
        const day = dailyMap[dayKey];
        const net = day.profit - day.loss;
        runningCapital += net;

        if (runningCapital > peak) peak = runningCapital;
        const drawdown = peak - runningCapital;
        if (drawdown > sessionMaxDrawdown) sessionMaxDrawdown = drawdown;

        return {
          date: dayKey,
          profit: day.profit,
          loss: day.loss,
          net,
          equity: runningCapital,
          drawdown,
          totalTrades: day.count
        };
      });

    // Today's Metrics (Always standard calendar)
    const todayData = dailyMap[todayStr] || { profit: 0, loss: 0, count: 0, wins: 0, rrValues: [] };
    const todayNet = todayData.profit - todayData.loss;
    const todayMetrics = {
      profit: todayData.profit,
      loss: todayData.loss,
      net: todayNet,
      winRate: todayData.count > 0 ? (todayData.wins / todayData.count) * 100 : 0,
      avgRR: todayData.rrValues.length > 0 ? `1:${(todayData.rrValues.reduce((a: number, b: number) => a + b, 0) / todayData.rrValues.length).toFixed(1)}` : '1:0.0',
      status: todayNet > 0 ? 'positive' : todayNet < 0 ? 'negative' : 'neutral'
    };

    // Monthly/Yearly Metrics (Calendar based so historical data stays visible)
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthlyData = monthlyMap[currentMonthKey] || { profit: 0, loss: 0, count: 0, wins: 0 };
    const monthlyNet = monthlyData.profit - monthlyData.loss;
    const monthlyMetrics = {
      profit: monthlyData.profit,
      loss: monthlyData.loss,
      net: monthlyNet,
      winRate: monthlyData.count > 0 ? (monthlyData.wins / monthlyData.count) * 100 : 0,
      roi: (initialCapital > 0) ? (monthlyNet / initialCapital) * 100 : 0,
      growth: initialCapital + monthlyNet
    };

    const yearlyTrades = rawRecords.filter(r => new Date(r.date).getUTCFullYear() === currentYear);
    const yearlyNet = yearlyTrades.reduce((acc, r) => acc + (parseFloat(r.profit) || 0) - (parseFloat(r.loss) || 0), 0);
    const yearlyMetrics = {
      profit: yearlyTrades.reduce((acc, r) => acc + (parseFloat(r.profit) || 0), 0),
      loss: yearlyTrades.reduce((acc, r) => acc + (parseFloat(r.loss) || 0), 0),
      net: yearlyNet,
      winRate: yearlyTrades.length > 0 ? (yearlyTrades.filter(r => (parseFloat(r.profit) || 0) > 0).length / yearlyTrades.length) * 100 : 0,
      roi: (initialCapital > 0) ? (yearlyNet / initialCapital) * 100 : 0,
      maxDrawdown: sessionMaxDrawdown, // Use session drawdown for relevant context
      bestMonth: Object.entries(monthlyMap).filter(([, v]) => v.year === currentYear).sort((a, b) => (b[1].profit - b[1].loss) - (a[1].profit - a[1].loss))[0]?.[0] || null,

      worstMonth: Object.entries(monthlyMap).filter(([, v]) => v.year === currentYear).sort((a, b) => (a[1].profit - a[1].loss) - (b[1].profit - b[1].loss))[0]?.[0] || null

    };

    // Session-based Stats for "All Time" (since reset)
    const sessionWinRate = sessionTotalCount > 0 ? (sessionWinCount / sessionTotalCount) * 100 : 0;
    const sessionProfitFactor = sessionLoss > 0 ? (sessionProfit / sessionLoss) : (sessionProfit > 0 ? 99.9 : 0);
    const sessionAvgWin = (sessionWinCount > 0) ? sessionProfit / sessionWinCount : 0;
    const sessionAvgLoss = (sessionTotalCount - sessionWinCount > 0) ? sessionLoss / (sessionTotalCount - sessionWinCount) : 0;
    const sessionExpectancy = ((sessionWinRate / 100) * sessionAvgWin) - ((1 - (sessionWinRate / 100)) * sessionAvgLoss);

    return NextResponse.json({
      initialCapital,
      currentCapital: runningCapital,
      totalPnL: runningCapital - initialCapital,
      capitalGrowthPercent: (initialCapital > 0) ? ((runningCapital - initialCapital) / initialCapital) * 100 : 0,
      today: todayMetrics,
      monthly: monthlyMetrics,
      yearly: yearlyMetrics,
      allTime: {
        profitFactor: sessionProfitFactor,
        expectancy: sessionExpectancy,
        winRate: sessionWinRate,
        netProfit: runningCapital - initialCapital,
        totalProfit: sessionProfit,
        totalLoss: sessionLoss,
        totalTrades: sessionTotalCount
      },
      chartData: sessionChartData,

      // Backward Compatibility
      winRate: sessionWinRate,
      totalWins: sessionWinCount,
      totalLosses: sessionTotalCount - sessionWinCount,
      totalProfitAllTime: runningCapital - initialCapital,
      maxDrawdown: sessionMaxDrawdown,
      profitFactor: sessionProfitFactor,
      expectancy: sessionExpectancy,
      avgLoss: sessionAvgLoss,
      winningStreak: 0,
      losingStreak: 0
    });

  } catch (error: unknown) {
    console.error('Analytics error:', error);
    const message = error instanceof Error ? error.message : 'Unknown analytics error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

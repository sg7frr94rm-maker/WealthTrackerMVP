import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getDividendCalendar,
  getDividends,
  getStats,
} from "../api/portfolioApi";

function DividendForecast() {
  const [calendarItems, setCalendarItems] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [stats, setStats] = useState(null);

  const money = (value, decimals = 2) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  const percent = (value, decimals = 1) =>
    `${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}%`;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [calendarRes, dividendsRes, statsRes] = await Promise.all([
          getDividendCalendar(),
          getDividends(),
          getStats(),
        ]);

        setCalendarItems(calendarRes.data || []);
        setDividends(dividendsRes.data.data || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to load dividend forecast data", error);
      }
    };

    loadData();
  }, []);

  const today = useMemo(() => new Date(), []);

  const oneYearAgo = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }, []);

  const oneYearLater = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }, []);

  const historicalDividends = dividends.filter((item) => {
    const date = new Date(item.date);
    return date >= oneYearAgo && date <= today;
  });

  const upcomingDividends = calendarItems.filter((item) => {
    const date = new Date(item.expectedDate);
    return date >= today && date <= oneYearLater;
  });

  const trailingAnnualDividend = historicalDividends.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const declaredUpcomingDividend = upcomingDividends.reduce(
    (sum, item) => sum + Number(item.expectedAmount || 0),
    0
  );

  const annualDividendIncome = Math.max(
    trailingAnnualDividend,
    declaredUpcomingDividend
  );

  const projectedMonthlyDividend = annualDividendIncome / 12;

  const currentPortfolioValue = Number(stats?.currentValue || 0);

  const portfolioYield =
    currentPortfolioValue > 0
      ? (annualDividendIncome / currentPortfolioValue) * 100
      : 0;

  let confidence = "Low";

  if (upcomingDividends.length >= 6) {
    confidence = "High";
  } else if (upcomingDividends.length >= 3) {
    confidence = "Medium";
  }

  const confidenceText =
    confidence === "High"
      ? "High — multiple upcoming dividend events declared."
      : confidence === "Medium"
      ? "Medium — some upcoming dividend events declared."
      : "Low — limited upcoming declared dividend events.";

  const forecastByMonth = useMemo(() => {
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);

      months.push({
        month: date.toLocaleString("en-SG", {
          month: "short",
          year: "numeric",
        }),
        amount: 0,
        declared: 0,
        estimated: 0,
      });
    }

    upcomingDividends.forEach((item) => {
      const date = new Date(item.expectedDate);

      const month = date.toLocaleString("en-SG", {
        month: "short",
        year: "numeric",
      });

      const match = months.find((m) => m.month === month);

      if (match) {
        match.declared += Number(item.expectedAmount || 0);
      }
    });

    const monthlyEstimate = annualDividendIncome / 12;

    months.forEach((month) => {
      month.estimated = monthlyEstimate;
      month.amount = month.declared > 0 ? month.declared : monthlyEstimate;
    });

    return months;
  }, [today, upcomingDividends, annualDividendIncome]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <ForecastCard
          title="Annual Dividend Income"
          value={money(annualDividendIncome)}
          positive
        />

        <ForecastCard
          title="Projected Monthly Dividend"
          value={money(projectedMonthlyDividend)}
          positive
        />

        <ForecastCard
          title="Portfolio Yield"
          value={percent(portfolioYield, 2)}
          positive
        />

        <ForecastCard
          title="Upcoming Dividend Events"
          value={upcomingDividends.length.toLocaleString("en-SG")}
          neutral
        />

        <ForecastCard
          title="Forecast Confidence"
          value={confidence}
          positive={confidence === "High"}
          neutral={confidence !== "High"}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="mb-2 font-bold">12-Month Dividend Forecast</h3>

        <p className="mb-4 text-sm text-slate-400">{confidenceText}</p>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis dataKey="month" stroke="#94a3b8" />

              <YAxis
                stroke="#94a3b8"
                tickFormatter={(value) =>
                  Number(value || 0).toLocaleString("en-SG")
                }
              />

              <Tooltip
                formatter={(value) => [money(value), "Forecast Dividend"]}
              />

              <Bar
                dataKey="amount"
                name="Forecast Dividend"
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Forecast uses declared calendar dividends where available. Other months
          use historical average dividends.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="mb-4 font-bold">Upcoming Dividend Schedule</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="p-3">Symbol</th>
                <th className="p-3">Expected Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Source</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>

            <tbody>
              {upcomingDividends.map((item) => (
                <tr key={item.id} className="border-b border-slate-800">
                  <td className="p-3 font-semibold">{item.symbol}</td>
                  <td className="p-3">{item.expectedDate}</td>
                  <td className="p-3 font-semibold text-emerald-400">
                    {money(item.expectedAmount)}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Declared
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{item.notes || "-"}</td>
                </tr>
              ))}

              {upcomingDividends.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    No upcoming declared dividends added yet. Forecast is
                    currently based on historical dividends.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ForecastCard({ title, value, positive, neutral = false }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          positive
            ? "text-emerald-400"
            : neutral
            ? "text-white"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default DividendForecast;
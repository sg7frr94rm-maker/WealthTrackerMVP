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

  useEffect(() => {
    const loadData = async () => {
      const [calendarRes, dividendsRes, statsRes] = await Promise.all([
        getDividendCalendar(),
        getDividends(),
        getStats(),
      ]);

      setCalendarItems(calendarRes.data || []);
      setDividends(dividendsRes.data.data || []);
      setStats(statsRes.data);
    };

    loadData();
  }, []);

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);

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

  const estimatedAnnualDividend = Math.max(
    trailingAnnualDividend,
    declaredUpcomingDividend
  );

  const projectedMonthlyIncome = estimatedAnnualDividend / 12;
  
  const monthlyIncomeGoal = 100;

  const incomeGoalProgress =
    monthlyIncomeGoal > 0
      ? (projectedMonthlyIncome / monthlyIncomeGoal) * 100
      : 0;

  const monthlyIncomeGap = Math.max(
    0,
     monthlyIncomeGoal - projectedMonthlyIncome
  );

const targetYield = 4;

const capitalRequired =
  monthlyIncomeGap > 0
    ? (monthlyIncomeGap * 12) / (targetYield / 100)
    : 0;

let confidence = "Low";

if (upcomingDividends.length >= 6) {
  confidence = "High";
} else if (upcomingDividends.length >= 3) {
  confidence = "Medium";
}

  const currentPortfolioValue = stats?.currentValue || 0;

  const trailingYield =
    currentPortfolioValue > 0
      ? (trailingAnnualDividend / currentPortfolioValue) * 100
      : 0;

  const estimatedYield =
    currentPortfolioValue > 0
      ? (estimatedAnnualDividend / currentPortfolioValue) * 100
      : 0;

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

    const monthlyEstimate = trailingAnnualDividend / 12;

    months.forEach((month) => {
      month.estimated = monthlyEstimate;
      month.amount =
        month.declared > 0
          ? month.declared
          : monthlyEstimate;
    });

    return months;
  }, [calendarItems, dividends]);

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Dividend Forecast Engine</h2>
        <p className="mt-1 text-sm text-slate-400">
          Hybrid forecast using historical dividends and upcoming declared dividends.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <ForecastCard
          title="Trailing Annual Dividend"
          value={`$${trailingAnnualDividend.toFixed(2)}`}
          positive
        />

        <ForecastCard
          title="Declared Upcoming Dividends"
          value={`$${declaredUpcomingDividend.toFixed(2)}`}
          positive
        />

        <ForecastCard
          title="Estimated Annual Dividend"
          value={`$${estimatedAnnualDividend.toFixed(2)}`}
          positive
        />

        <ForecastCard
          title="Projected Monthly Income"
          value={`$${projectedMonthlyIncome.toFixed(2)}`}
          positive
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <ForecastCard
          title="Trailing Yield"
          value={`${trailingYield.toFixed(2)}%`}
          positive
        />

        <ForecastCard
          title="Estimated Yield"
          value={`${estimatedYield.toFixed(2)}%`}
          positive
        />

        <ForecastCard
          title="Upcoming Events"
          value={upcomingDividends.length}
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
  <ForecastCard
    title="Monthly Income Goal"
    value={`$${monthlyIncomeGoal.toFixed(2)}`}
  />

  <ForecastCard
    title="Goal Progress"
    value={`${incomeGoalProgress.toFixed(1)}%`}
    positive
  />

  <ForecastCard
    title="Income Gap"
    value={`$${monthlyIncomeGap.toFixed(2)}`}
  />

  <ForecastCard
    title="Forecast Confidence"
    value={confidence}
    positive={confidence === "High"}
  />
</div>

<div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
  <h3 className="mb-4 font-bold">Income Gap Analysis</h3>

  <div className="grid gap-4 md:grid-cols-3">
    <ForecastCard
      title="Current Monthly Income"
      value={`$${projectedMonthlyIncome.toFixed(2)}`}
      positive
    />

    <ForecastCard
      title="Target Monthly Income"
      value={`$${monthlyIncomeGoal.toFixed(2)}`}
    />

    <ForecastCard
      title="Capital Required at 4% Yield"
      value={`$${capitalRequired.toFixed(0)}`}
    />
  </div>

  <div className="mt-5">
    <div className="mb-2 flex justify-between text-sm">
      <span>Income Goal Progress</span>
      <span>{incomeGoalProgress.toFixed(1)}%</span>
    </div>

    <div className="h-3 rounded-full bg-slate-800">
      <div
        className="h-3 rounded-full bg-emerald-500"
        style={{
          width: `${Math.min(incomeGoalProgress, 100)}%`,
        }}
      />
    </div>
  </div>
</div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="mb-4 font-bold">12-Month Dividend Forecast</h3>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar
                dataKey="amount"
                name="Forecast Dividend"
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Forecast uses declared calendar dividends where available. Other months use historical average dividends.
        </p>
      </div>

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
                  ${Number(item.expectedAmount).toFixed(2)}
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Declared
                  </span>
                </td>
                <td className="p-3 text-slate-400">
                  {item.notes || "-"}
                </td>
              </tr>
            ))}

            {upcomingDividends.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  No upcoming declared dividends added yet. Forecast is currently based on historical dividends.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ForecastCard({ title, value, positive }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          positive ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default DividendForecast;
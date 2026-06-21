import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function WealthDashboardSummary({
  netWorth,
  portfolioValue,
  portfolioGoal,
  monthlyPassiveIncome,
  monthlyIncomeGoal,
  totalDividends,
  dividendCalendar,
  performance,
  trendData = [],
  totalReturnPercent = 0,
  goalProgress = 0,
  bestPerformer,
  worstPerformer,
}) {
  const [trendRange, setTrendRange] = useState("ALL");

  const portfolioProgress =
    portfolioGoal > 0 ? (portfolioValue / portfolioGoal) * 100 : 0;

  const incomeProgress =
    monthlyIncomeGoal > 0
      ? (monthlyPassiveIncome / monthlyIncomeGoal) * 100
      : 0;

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const money = (value) => `$${formatNumber(value)}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-SG", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "-";

  const nextDividend = [...(dividendCalendar || [])]
    .filter((item) => new Date(item.expectedDate) >= new Date())
    .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate))[0];

  const largestHolding =
    performance && performance.length > 0
      ? [...performance].sort(
          (a, b) => Number(b.currentValue || 0) - Number(a.currentValue || 0)
        )[0]
      : null;

  const largestHoldingPercent =
    largestHolding && portfolioValue > 0
      ? (Number(largestHolding.currentValue || 0) / portfolioValue) * 100
      : 0;

  const formattedTrendData = useMemo(() => {
    return [...(trendData || [])]
      .map((item) => ({
        ...item,
        value: Number(item.value || 0),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trendData]);

  const filteredTrendData = useMemo(() => {
    if (trendRange === "ALL") {
      return formattedTrendData;
    }

    const days =
      trendRange === "1M"
        ? 30
        : trendRange === "1Y"
        ? 365
        : trendRange === "3Y"
        ? 365 * 3
        : 365 * 5;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return formattedTrendData.filter(
      (item) => new Date(item.date) >= cutoff
    );
  }, [formattedTrendData, trendRange]);

  const displayTrendData =
    filteredTrendData.length > 0 ? filteredTrendData : formattedTrendData;

  const trendStartDate =
    displayTrendData.length > 0 ? displayTrendData[0].date : null;

  const trendEndDate =
    displayTrendData.length > 0
      ? displayTrendData[displayTrendData.length - 1].date
      : null;

  return (
    <section className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-xl font-bold">Wealth Overview</h2>

          <p className="mt-1 text-sm text-slate-400">
            High-level snapshot of your net worth, portfolio progress, passive
            income and investment performance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Net Worth"
            value={money(netWorth)}
            subtitle="Total assets minus liabilities"
          />

          <SummaryCard
            title="Portfolio Value"
            value={money(portfolioValue)}
            subtitle={`Goal progress: ${portfolioProgress.toFixed(2)}%`}
          />

          <SummaryCard
            title="Monthly Passive Income"
            value={money(monthlyPassiveIncome)}
            subtitle={`Income goal: ${incomeProgress.toFixed(2)}%`}
          />

          <SummaryCard
            title="Total Dividends"
            value={money(totalDividends)}
            subtitle={
              nextDividend
                ? `Next: ${nextDividend.symbol} on ${nextDividend.expectedDate}`
                : "No upcoming dividend"
            }
          />

          <SummaryCard
            title="Total Return"
            value={`${Number(totalReturnPercent || 0).toFixed(2)}%`}
            subtitle="Profit/loss plus dividends"
            positive={Number(totalReturnPercent || 0) >= 0}
          />

          <SummaryCard
            title="Goal Progress"
            value={`${Number(goalProgress || 0).toFixed(2)}%`}
            subtitle="Towards portfolio goal"
            positive={Number(goalProgress || 0) >= 50}
          />

          <SummaryCard
            title="Best Performer"
            value={bestPerformer?.symbol || "-"}
            subtitle={
              bestPerformer
                ? `${Number(bestPerformer.profitLossPercent || 0).toFixed(2)}%`
                : "No holdings yet"
            }
            positive={Number(bestPerformer?.profitLossPercent || 0) >= 0}
          />

          <SummaryCard
            title="Worst Performer"
            value={worstPerformer?.symbol || "-"}
            subtitle={
              worstPerformer
                ? `${Number(worstPerformer.profitLossPercent || 0).toFixed(2)}%`
                : "No holdings yet"
            }
            positive={Number(worstPerformer?.profitLossPercent || 0) >= 0}
          />
        </div>
      </section>

      {formattedTrendData.length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold">Growth Trend</h2>

                {trendStartDate && trendEndDate && (
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-400">
                    {formatDate(trendStartDate)} → {formatDate(trendEndDate)}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Track how your portfolio value changes over time from saved
                snapshots.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {["1M", "1Y", "3Y", "5Y", "ALL"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTrendRange(range)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      trendRange === range
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {range === "ALL" ? "All" : range}
                  </button>
                ))}
              </div>
            </div>

            {largestHolding && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm">
                <p className="text-slate-400">Largest Holding</p>

                <p className="font-bold text-slate-100">
                  {largestHolding.symbol} — {largestHoldingPercent.toFixed(2)}%
                </p>
              </div>
            )}
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                <XAxis dataKey="date" stroke="#94a3b8" />

                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(value) =>
                    Number(value || 0).toLocaleString("en-SG")
                  }
                />

                <Tooltip
                  formatter={(value) => [money(value), "Portfolio Value"]}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </section>
  );
}

function SummaryCard({ title, value, subtitle, positive = true }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

export default WealthDashboardSummary;
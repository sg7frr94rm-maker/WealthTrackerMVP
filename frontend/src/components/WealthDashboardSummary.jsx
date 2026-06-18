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
}) {
  const portfolioProgress =
    portfolioGoal > 0 ? (portfolioValue / portfolioGoal) * 100 : 0;

  const incomeProgress =
    monthlyIncomeGoal > 0
      ? (monthlyPassiveIncome / monthlyIncomeGoal) * 100
      : 0;

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

  const formattedTrendData = (trendData || []).map((item) => ({
    ...item,
    value: Number(item.value || 0),
  }));

  return (
    <section className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-xl font-bold">Wealth Dashboard Summary</h2>
          <p className="mt-1 text-sm text-slate-400">
            High-level snapshot of your portfolio, wealth progress, income and upcoming activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Net Worth"
            value={`$${Number(netWorth || 0).toFixed(2)}`}
            subtitle="Total assets minus liabilities"
          />

          <SummaryCard
            title="Portfolio Value"
            value={`$${Number(portfolioValue || 0).toFixed(2)}`}
            subtitle={`Goal progress: ${portfolioProgress.toFixed(2)}%`}
          />

          <SummaryCard
            title="Monthly Passive Income"
            value={`$${Number(monthlyPassiveIncome || 0).toFixed(2)}`}
            subtitle={`Income goal: ${incomeProgress.toFixed(2)}%`}
          />

          <SummaryCard
            title="Total Dividends"
            value={`$${Number(totalDividends || 0).toFixed(2)}`}
            subtitle={
              nextDividend
                ? `Next: ${nextDividend.symbol} on ${nextDividend.expectedDate}`
                : "No upcoming dividend"
            }
          />
        </div>
      </section>

      {formattedTrendData.length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Growth Trend</h2>
              <p className="mt-1 text-sm text-slate-400">
                Track how your portfolio value changes over time from saved snapshots.
              </p>
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
              <LineChart data={formattedTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Portfolio Value"]}
                  labelFormatter={(label) => `Date: ${label}`}
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

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

export default WealthDashboardSummary;
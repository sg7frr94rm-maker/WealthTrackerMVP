function WealthDashboardSummary({
  netWorth,
  portfolioValue,
  portfolioGoal,
  monthlyPassiveIncome,
  monthlyIncomeGoal = 100,
  fireNumber,
  dividendCalendar = [],
  performance = [],
}) {
  const goalProgress =
    portfolioGoal > 0 ? (portfolioValue / portfolioGoal) * 100 : 0;

  const incomeProgress =
    monthlyIncomeGoal > 0
      ? (monthlyPassiveIncome / monthlyIncomeGoal) * 100
      : 0;

  const largestPosition = [...performance].sort(
    (a, b) => b.currentValue - a.currentValue
  )[0];

  const nextDividend = [...dividendCalendar]
    .filter((item) => new Date(item.expectedDate) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.expectedDate) - new Date(b.expectedDate)
  )[0];

  const incomeGap = Math.max(
    0,
    monthlyIncomeGoal - monthlyPassiveIncome
  );

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Wealth Dashboard Summary</h2>
        <p className="mt-1 text-sm text-slate-400">
          Quick overview of your current financial position.
        </p>
      </div>

      <section className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/30 p-5">
        <h3 className="mb-3 text-lg font-bold text-emerald-400">
          Today's Briefing
        </h3>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <BriefingItem
            label="Largest Holding"
            value={largestPosition?.symbol || "N/A"}
          />

          <BriefingItem
            label="Next Dividend"
            value={
              nextDividend
                ? `${nextDividend.symbol} — $${Number(
                    nextDividend.expectedAmount || 0
                  ).toFixed(2)}`
                : "None Scheduled"
            }
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Net Worth" value={`$${netWorth.toFixed(2)}`} positive />

        <SummaryCard
          title="Portfolio Value"
          value={`$${portfolioValue.toFixed(2)}`}
          positive
        />

        <SummaryCard
          title="Goal Progress"
          value={`${goalProgress.toFixed(2)}%`}
          positive={goalProgress >= 50}
        />

        <SummaryCard
          title="Monthly Income"
          value={`$${monthlyPassiveIncome.toFixed(2)}`}
          positive
        />
      </div>
    </section>
  );
}

function BriefingItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-950/70 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-100">{value}</p>
    </div>
  );
}

function SummaryCard({ title, value, positive }) {
  const hasColor = positive !== undefined;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          hasColor
            ? positive
              ? "text-emerald-400"
              : "text-yellow-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default WealthDashboardSummary;
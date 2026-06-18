function MilestoneProgress({
  portfolioValue,
  portfolioGoal,
  totalDividends,
  monthlyPassiveIncome,
}) {
  const milestones = [
    {
      title: "Portfolio $75,000",
      current: portfolioValue,
      target: 75000,
      type: "Portfolio",
    },
    {
      title: "Portfolio Goal",
      current: portfolioValue,
      target: portfolioGoal,
      type: "Goal",
    },
    {
      title: "Dividend Income $500/year",
      current: totalDividends,
      target: 500,
      type: "Income",
    },
    {
      title: "Passive Income $100/month",
      current: monthlyPassiveIncome,
      target: 100,
      type: "Income",
    },
  ];

  const sortedMilestones = milestones
    .map((item) => {
      const progress =
        item.target > 0
          ? Math.min((item.current / item.target) * 100, 100)
          : 0;

      const remaining = Math.max(item.target - item.current, 0);

      return {
        ...item,
        progress,
        remaining,
      };
    })
    .sort((a, b) => b.progress - a.progress);

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Milestone Progress
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Track the closest financial milestones you are working toward.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedMilestones.map((item) => (
          <MilestoneCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function MilestoneCard({ item }) {
  const isCompleted = item.progress >= 100;

  return (
    <div
      className={`rounded-xl border p-5 ${
        isCompleted
          ? "border-emerald-700 bg-emerald-950/40"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{item.type}</p>

          <h3 className="font-bold">{item.title}</h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isCompleted
              ? "bg-emerald-900 text-emerald-300"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {isCompleted ? "Achieved" : "In Progress"}
        </span>
      </div>

      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-400">Progress</span>
        <span className="font-semibold">
          {item.progress.toFixed(1)}%
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-emerald-500"
          style={{
            width: `${item.progress}%`,
          }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SmallInfo
          label="Current"
          value={
            item.isPercent
              ? `${item.current.toFixed(1)}%`
              : `$${item.current.toFixed(2)}`
          }
        />

        <SmallInfo
          label="Remaining"
          value={
            item.isPercent
              ? `${item.remaining.toFixed(1)}%`
              : `$${item.remaining.toFixed(2)}`
          }
        />
      </div>
    </div>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-900 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

export default MilestoneProgress;
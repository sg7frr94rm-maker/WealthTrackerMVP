function MilestoneTracker({
  portfolioValue,
  netWorth = 1188151.77,
}) {
  const portfolioMilestones = [
    10000,
    25000,
    50000,
    100000,
    250000,
    500000,
    1000000,
  ];

  const netWorthMilestones = [
    100000,
    250000,
    500000,
    1000000,
    1500000,
    2000000,
    3000000,
  ];

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Milestone Tracker</h2>
        <p className="mt-1 text-sm text-slate-400">
          Track your portfolio and net worth achievements.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MilestoneGroup
          title="Portfolio Milestones"
          currentValue={portfolioValue}
          milestones={portfolioMilestones}
        />

        <MilestoneGroup
          title="Net Worth Milestones"
          currentValue={netWorth}
          milestones={netWorthMilestones}
        />
      </div>
    </section>
  );
}

function MilestoneGroup({ title, currentValue, milestones }) {
  const completed = milestones.filter(
    (amount) => currentValue >= amount
  ).length;

  const progress =
    milestones.length > 0
      ? (completed / milestones.length) * 100
      : 0;

  const nextMilestone = milestones.find(
    (amount) => currentValue < amount
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold">{title}</h3>

          <p className="mt-1 text-sm text-slate-400">
            Current: ${currentValue.toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">
            {completed}/{milestones.length}
          </p>
          <p className="text-sm text-slate-400">Completed</p>
        </div>
      </div>

      <div className="mb-5 h-3 w-full rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {milestones.map((amount) => {
          const reached = currentValue >= amount;

          return (
            <div
              key={amount}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                reached
                  ? "border-emerald-800 bg-emerald-950/30"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <div>
                <p className="font-semibold">
                  ${amount.toLocaleString()}
                </p>

                <p className="text-sm text-slate-400">
                  {reached ? "Achieved" : "In progress"}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  reached
                    ? "bg-emerald-900 text-emerald-300"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {reached ? "✓ Done" : "Next"}
              </span>
            </div>
          );
        })}
      </div>

      {nextMilestone && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Next Milestone</p>

          <p className="mt-1 text-lg font-bold text-white">
            ${nextMilestone.toLocaleString()}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Remaining: $
            {(nextMilestone - currentValue).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default MilestoneTracker;
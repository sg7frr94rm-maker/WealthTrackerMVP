function YearsToGoal({
  currentValue,
  portfolioGoal,
  monthlyContribution = 1000,
  annualReturn = 8,
}) {
  const monthlyRate = annualReturn / 100 / 12;

  let monthsToGoal = 0;
  let projectedValue = Number(currentValue || 0);

  while (
    projectedValue < Number(portfolioGoal || 0) &&
    monthsToGoal < 12 * 80
  ) {
    projectedValue =
      projectedValue * (1 + monthlyRate) + Number(monthlyContribution || 0);

    monthsToGoal++;
  }

  const years = Math.floor(monthsToGoal / 12);
  const months = monthsToGoal % 12;

  const remainingAmount = Math.max(
    Number(portfolioGoal || 0) - Number(currentValue || 0),
    0
  );

  const goalReached =
    Number(currentValue || 0) >= Number(portfolioGoal || 0);

  const estimatedDate = new Date();
  estimatedDate.setMonth(estimatedDate.getMonth() + monthsToGoal);

  const estimatedDateText = goalReached
    ? "Goal Already Reached"
    : estimatedDate.toLocaleDateString("en-SG", {
        month: "long",
        year: "numeric",
      });

  const timeRemainingText = goalReached
    ? "0 Years"
    : `${years} Years ${months} Months`;

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-5 text-xl font-bold">Years to Goal</h2>

      <div className="grid gap-4 md:grid-cols-4">
        <GoalCard
          title="Remaining Amount"
          value={money(remainingAmount)}
        />

        <GoalCard
          title="Time Remaining"
          value={timeRemainingText}
          positive={goalReached}
        />

        <GoalCard
          title="Estimated Goal Date"
          value={estimatedDateText}
          positive={goalReached}
        />

        <GoalCard
          title="Assumption"
          value={`${money(monthlyContribution)}/mo @ ${annualReturn}%`}
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <GoalCard
            title="Current Portfolio"
            value={money(currentValue)}
          />

          <GoalCard
            title="Portfolio Goal"
            value={money(portfolioGoal)}
          />

          <GoalCard
            title="Projected Value at Goal"
            value={money(projectedValue)}
            positive
          />
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-400">
        Estimate is based on monthly contributions and expected annual return.
        Actual results may vary depending on market performance.
      </p>
    </section>
  );
}

function GoalCard({ title, value, positive }) {
  const hasColor = positive !== undefined;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-xl font-bold ${
          hasColor
            ? positive
              ? "text-emerald-400"
              : "text-white"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default YearsToGoal;
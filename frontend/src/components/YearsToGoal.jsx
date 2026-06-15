function YearsToGoal({
  currentValue,
  portfolioGoal,
  monthlyContribution = 1000,
  annualReturn = 8,
}) {
  const monthlyRate = annualReturn / 100 / 12;

  let monthsToGoal = 0;
  let projectedValue = currentValue;

  while (projectedValue < portfolioGoal && monthsToGoal < 12 * 80) {
    projectedValue =
      projectedValue * (1 + monthlyRate) + monthlyContribution;

    monthsToGoal++;
  }

  const years = Math.floor(monthsToGoal / 12);
  const months = monthsToGoal % 12;

  const remainingAmount = Math.max(portfolioGoal - currentValue, 0);

  const goalReached = currentValue >= portfolioGoal;

  const estimatedDate = new Date();
  estimatedDate.setMonth(estimatedDate.getMonth() + monthsToGoal);

  const estimatedDateText = goalReached
    ? "Goal already reached"
    : estimatedDate.toLocaleDateString("en-SG", {
        month: "long",
        year: "numeric",
      });

  const timeRemainingText = goalReached
    ? "0 years"
    : `${years} years ${months} months`;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-5 text-xl font-bold">Years to Goal</h2>

      <div className="grid gap-4 md:grid-cols-4">
        <GoalCard
          title="Remaining Amount"
          value={`$${remainingAmount.toFixed(2)}`}
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
          value={`$${monthlyContribution}/mo @ ${annualReturn}%`}
        />
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
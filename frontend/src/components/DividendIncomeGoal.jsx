function DividendIncomeGoal({
  monthlyPassiveIncome,
  monthlyIncomeGoal = 100,
}) {
  const progress =
    monthlyIncomeGoal > 0
      ? (monthlyPassiveIncome / monthlyIncomeGoal) * 100
      : 0;

  const remainingIncome = Math.max(
    monthlyIncomeGoal - monthlyPassiveIncome,
    0
  );

  const goalReached = monthlyPassiveIncome >= monthlyIncomeGoal;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Dividend Income Goal</h2>
          <p className="mt-1 text-sm text-slate-400">
            Track your progress toward monthly passive income.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-3xl font-bold text-emerald-400">
            {Math.min(progress, 100).toFixed(2)}%
          </p>
          <p className="text-sm text-slate-400">Progress</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <IncomeCard
          title="Current Monthly Income"
          value={`$${monthlyPassiveIncome.toFixed(2)}`}
          positive
        />

        <IncomeCard
          title="Monthly Income Goal"
          value={`$${monthlyIncomeGoal.toFixed(2)}`}
        />

        <IncomeCard
          title="Remaining Income Gap"
          value={`$${remainingIncome.toFixed(2)}`}
          positive={goalReached}
        />
      </div>

      <div className="mt-6 h-4 w-full rounded-full bg-slate-800">
        <div
          className="h-4 rounded-full bg-emerald-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="font-bold">Income Strategy</h3>

        <p className="mt-2 text-sm text-slate-400">
          {goalReached
            ? "You have reached your monthly passive income goal. Consider increasing the target or reinvesting dividends for faster compounding."
            : "To increase monthly passive income, continue building dividend-paying assets and reinvest distributions where suitable."}
        </p>
      </div>
    </section>
  );
}

function IncomeCard({ title, value, positive }) {
  const hasColor = positive !== undefined;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          hasColor
            ? positive
              ? "text-emerald-400"
              : "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default DividendIncomeGoal;
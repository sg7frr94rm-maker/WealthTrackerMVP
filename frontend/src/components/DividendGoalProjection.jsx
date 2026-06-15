import { useState } from "react";

function DividendGoalProjection({
  currentMonthlyIncome,
  currentPortfolioValue,
}) {
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(100);
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [targetYield, setTargetYield] = useState(4);

  const monthlyGap = Math.max(0, monthlyIncomeGoal - currentMonthlyIncome);

  const capitalRequired =
    monthlyGap > 0 ? (monthlyGap * 12) / (targetYield / 100) : 0;

  const monthsToGoal =
    monthlyInvestment > 0 ? Math.ceil(capitalRequired / monthlyInvestment) : 0;

  const years = Math.floor(monthsToGoal / 12);
  const months = monthsToGoal % 12;

  const projectedPortfolioValue = currentPortfolioValue + capitalRequired;

  const goalReachedDate = new Date();
  goalReachedDate.setMonth(goalReachedDate.getMonth() + monthsToGoal);

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Dividend Goal Projection</h2>
        <p className="mt-1 text-sm text-slate-400">
          Estimate how long it may take to reach your passive income target.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <InputBox
          label="Monthly Income Goal"
          value={monthlyIncomeGoal}
          onChange={setMonthlyIncomeGoal}
        />

        <InputBox
          label="Monthly Investment"
          value={monthlyInvestment}
          onChange={setMonthlyInvestment}
        />

        <InputBox
          label="Target Yield (%)"
          value={targetYield}
          onChange={setTargetYield}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ProjectionCard
          title="Current Monthly Income"
          value={`$${currentMonthlyIncome.toFixed(2)}`}
          positive
        />

        <ProjectionCard
          title="Income Gap"
          value={`$${monthlyGap.toFixed(2)}`}
        />

        <ProjectionCard
          title="Capital Required"
          value={`$${capitalRequired.toFixed(0)}`}
        />

        <ProjectionCard
          title="Projected Portfolio Value"
          value={`$${projectedPortfolioValue.toFixed(0)}`}
          positive
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="font-bold">Estimated Time to Goal</h3>

        <p className="mt-3 text-3xl font-bold text-emerald-400">
          {monthlyGap === 0
            ? "Goal Achieved"
            : `${years} years ${months} months`}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Estimated goal date:{" "}
          <span className="font-semibold text-slate-200">
            {monthlyGap === 0
              ? "Now"
              : goalReachedDate.toLocaleDateString("en-SG", {
                  month: "long",
                  year: "numeric",
                })}
          </span>
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span>Income Goal Progress</span>
            <span>
              {monthlyIncomeGoal > 0
                ? Math.min(
                    (currentMonthlyIncome / monthlyIncomeGoal) * 100,
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </span>
          </div>

          <div className="h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-emerald-500"
              style={{
                width: `${
                  monthlyIncomeGoal > 0
                    ? Math.min(
                        (currentMonthlyIncome / monthlyIncomeGoal) * 100,
                        100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function InputBox({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">{label}</label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
      />
    </div>
  );
}

function ProjectionCard({ title, value, positive }) {
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

export default DividendGoalProjection;
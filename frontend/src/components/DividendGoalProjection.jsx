import { useState } from "react";

function DividendGoalProjection({
  currentMonthlyIncome,
  currentPortfolioValue,
}) {
  const [monthlyDividendGoal, setMonthlyDividendGoal] = useState(100);
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [targetYield, setTargetYield] = useState(4);

  const safeCurrentMonthlyDividend = Number(currentMonthlyIncome || 0);
  const safeCurrentPortfolioValue = Number(currentPortfolioValue || 0);
  const safeMonthlyDividendGoal = Number(monthlyDividendGoal || 0);
  const safeMonthlyInvestment = Number(monthlyInvestment || 0);
  const safeTargetYield = Number(targetYield || 0);

  const money = (value, decimals = 0) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  const monthlyDividendGap = Math.max(
    0,
    safeMonthlyDividendGoal - safeCurrentMonthlyDividend
  );

  const capitalRequired =
    monthlyDividendGap > 0 && safeTargetYield > 0
      ? (monthlyDividendGap * 12) / (safeTargetYield / 100)
      : 0;

  const monthsToGoal =
    safeMonthlyInvestment > 0
      ? Math.ceil(capitalRequired / safeMonthlyInvestment)
      : 0;

  const years = Math.floor(monthsToGoal / 12);
  const months = monthsToGoal % 12;

  const projectedPortfolioValue =
    safeCurrentPortfolioValue + capitalRequired;

  const goalReachedDate = new Date();
  goalReachedDate.setMonth(goalReachedDate.getMonth() + monthsToGoal);

  const dividendGoalProgress =
    safeMonthlyDividendGoal > 0
      ? Math.min(
          (safeCurrentMonthlyDividend / safeMonthlyDividendGoal) * 100,
          100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <InputBox
          label="Monthly Dividend Goal"
          value={monthlyDividendGoal}
          onChange={setMonthlyDividendGoal}
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
          title="Current Monthly Dividend"
          value={money(safeCurrentMonthlyDividend, 2)}
          positive
        />

        <ProjectionCard
          title="Dividend Gap"
          value={money(monthlyDividendGap, 2)}
        />

        <ProjectionCard
          title="Capital Required"
          value={money(capitalRequired)}
        />

        <ProjectionCard
          title="Projected Portfolio Value"
          value={money(projectedPortfolioValue)}
          positive
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="font-bold">Estimated Time to Dividend Goal</h3>

        <p className="mt-3 text-3xl font-bold text-emerald-400">
          {monthlyDividendGap === 0
            ? "Goal Achieved"
            : `${years} years ${months} months`}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Estimated goal date:{" "}
          <span className="font-semibold text-slate-200">
            {monthlyDividendGap === 0
              ? "Now"
              : goalReachedDate.toLocaleDateString("en-SG", {
                  month: "long",
                  year: "numeric",
                })}
          </span>
        </p>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm">
            <span>Dividend Goal Progress</span>
            <span>{dividendGoalProgress.toFixed(1)}%</span>
          </div>

          <div className="h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-emerald-500"
              style={{
                width: `${dividendGoalProgress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
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
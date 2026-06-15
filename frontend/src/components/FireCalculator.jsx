import { useState } from "react";

function FireCalculator({ currentValue }) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const annualExpenses = monthlyExpenses * 12;

  const fireNumber =
    withdrawalRate > 0 ? annualExpenses / (withdrawalRate / 100) : 0;

  const fireProgress =
    fireNumber > 0 ? (currentValue / fireNumber) * 100 : 0;

  const monthlyRate = annualReturn / 100 / 12;

  let monthsToFire = 0;
  let projectedValue = currentValue;

  while (projectedValue < fireNumber && monthsToFire < 12 * 80) {
    projectedValue =
      projectedValue * (1 + monthlyRate) + monthlyContribution;

    monthsToFire++;
  }

  const years = Math.floor(monthsToFire / 12);
  const months = monthsToFire % 12;

  const estimatedDate = new Date();
  estimatedDate.setMonth(estimatedDate.getMonth() + monthsToFire);

  const goalReached = currentValue >= fireNumber;

  const timeText = goalReached
    ? "FIRE reached"
    : monthsToFire >= 12 * 80
    ? "More than 80 years"
    : `${years} years ${months} months`;

  const dateText = goalReached
    ? "FIRE reached"
    : monthsToFire >= 12 * 80
    ? "Beyond projection"
    : estimatedDate.toLocaleDateString("en-SG", {
        month: "long",
        year: "numeric",
      });

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">FIRE Calculator</h2>
          <p className="mt-1 text-sm text-slate-400">
            Estimate your financial independence target and timeline.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-3xl font-bold text-emerald-400">
            {Math.min(fireProgress, 100).toFixed(2)}%
          </p>
          <p className="text-sm text-slate-400">FIRE Progress</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InputBox
          label="Monthly Expenses"
          value={monthlyExpenses}
          onChange={setMonthlyExpenses}
        />

        <InputBox
          label="Monthly Investment"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
        />

        <InputBox
          label="Expected Annual Return (%)"
          value={annualReturn}
          onChange={setAnnualReturn}
        />

        <InputBox
          label="Withdrawal Rate (%)"
          value={withdrawalRate}
          onChange={setWithdrawalRate}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <FireCard
          title="FIRE Number"
          value={`$${fireNumber.toFixed(2)}`}
          positive
        />

        <FireCard
          title="Current Portfolio"
          value={`$${currentValue.toFixed(2)}`}
        />

        <FireCard
          title="Time to FIRE"
          value={timeText}
        />

        <FireCard
          title="Estimated FIRE Date"
          value={dateText}
        />
      </div>

      <div className="mt-6 h-4 w-full rounded-full bg-slate-800">
        <div
          className="h-4 rounded-full bg-emerald-500"
          style={{ width: `${Math.min(fireProgress, 100)}%` }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="font-bold">FIRE Strategy</h3>

        <p className="mt-2 text-sm text-slate-400">
          This estimate uses the common withdrawal-rate method. A lower expense
          level, higher monthly investment, or higher long-term return can reduce
          the time needed to reach financial independence.
        </p>
      </div>
    </section>
  );
}

function InputBox({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
      />
    </div>
  );
}

function FireCard({ title, value, positive }) {
  const hasColor = positive !== undefined;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-xl font-bold ${
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

export default FireCalculator;
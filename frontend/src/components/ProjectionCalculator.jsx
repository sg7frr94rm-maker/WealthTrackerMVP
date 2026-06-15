import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ProjectionCalculator({ currentValue, portfolioGoal = 100000 }) {
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(10);

  const months = years * 12;
  const monthlyRate = annualReturn / 100 / 12;

  const futureValue =
    monthlyRate > 0
      ? currentValue * Math.pow(1 + monthlyRate, months) +
        monthlyContribution *
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : currentValue + monthlyContribution * months;

  const totalContribution = monthlyContribution * months;
  const projectedGain = futureValue - currentValue - totalContribution;

  const projectionData = [];

  for (let year = 0; year <= years; year++) {
    const currentMonths = year * 12;

    const value =
      monthlyRate > 0
        ? currentValue * Math.pow(1 + monthlyRate, currentMonths) +
          monthlyContribution *
            ((Math.pow(1 + monthlyRate, currentMonths) - 1) / monthlyRate)
        : currentValue + monthlyContribution * currentMonths;

    projectionData.push({
      year: `Year ${year}`,
      value: Number(value.toFixed(2)),
    });
  }

  let yearsToGoal = 0;
  let goalValue = currentValue;

  while (goalValue < portfolioGoal && yearsToGoal < 60) {
    goalValue =
      goalValue * (1 + annualReturn / 100) + monthlyContribution * 12;

    yearsToGoal++;
  }

  const goalText =
    currentValue >= portfolioGoal
      ? "Goal Reached"
      : yearsToGoal >= 60
      ? "More than 60 years"
      : `${yearsToGoal} years`;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-5 text-xl font-bold">
        Portfolio Projection Calculator
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Monthly Investment
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Expected Annual Return (%)
          </label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">Years</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <ProjectionCard
          title="Current Portfolio"
          value={`$${currentValue.toFixed(2)}`}
        />

        <ProjectionCard
          title="Projected Portfolio Value"
          value={`$${futureValue.toFixed(2)}`}
          positive
        />

        <ProjectionCard
          title="Total Contributions"
          value={`$${totalContribution.toFixed(2)}`}
        />

        <ProjectionCard
          title="Projected Investment Gain"
          value={`$${projectedGain.toFixed(2)}`}
          positive={projectedGain >= 0}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold">Projection Growth Chart</h3>
            <p className="text-sm text-slate-400">
              Estimated portfolio value over time.
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-2xl font-bold text-emerald-400">{goalText}</p>
            <p className="text-sm text-slate-400">Years to $100,000 goal</p>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function ProjectionCard({ title, value, positive }) {
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

export default ProjectionCalculator;
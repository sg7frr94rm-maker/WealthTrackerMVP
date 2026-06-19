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

function DividendSnowballSimulator({
  currentAnnualDividend,
  currentPortfolioValue,
}) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [dividendYield, setDividendYield] = useState(4);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(5);
  const [years, setYears] = useState(20);
  const [reinvestDividends, setReinvestDividends] = useState(true);

  const projectionData = [];

  let portfolioValue = Number(currentPortfolioValue || 0);
  let annualDividend = Number(currentAnnualDividend || 0);

  for (let year = 0; year <= years; year++) {
    projectionData.push({
      year,
      portfolioValue: Number(portfolioValue.toFixed(2)),
      annualDividend: Number(annualDividend.toFixed(2)),
      monthlyIncome: Number((annualDividend / 12).toFixed(2)),
    });

    const yearlyContribution = Number(monthlyInvestment || 0) * 12;
    const reinvestedDividend = reinvestDividends ? annualDividend : 0;

    portfolioValue =
      portfolioValue + yearlyContribution + reinvestedDividend;

    annualDividend = portfolioValue * (Number(dividendYield || 0) / 100);
    annualDividend =
      annualDividend * (1 + Number(dividendGrowthRate || 0) / 100);
  }

  const year5 = projectionData.find((item) => item.year === 5);
  const year10 = projectionData.find((item) => item.year === 10);
  const finalYear = projectionData[projectionData.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <InputBox
          label="Monthly Investment"
          value={monthlyInvestment}
          onChange={setMonthlyInvestment}
        />

        <InputBox
          label="Dividend Yield (%)"
          value={dividendYield}
          onChange={setDividendYield}
        />

        <InputBox
          label="Dividend Growth (%)"
          value={dividendGrowthRate}
          onChange={setDividendGrowthRate}
        />

        <InputBox
          label="Years"
          value={years}
          onChange={setYears}
        />

        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Reinvest Dividends
          </label>

          <button
            type="button"
            onClick={() => setReinvestDividends(!reinvestDividends)}
            className={`h-12 w-full rounded-lg font-semibold ${
              reinvestDividends
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {reinvestDividends ? "Yes" : "No"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SnowballCard
          title="Current Annual Dividend"
          value={`$${Number(currentAnnualDividend || 0).toFixed(2)}`}
          positive
        />

        <SnowballCard
          title="Year 5 Annual Dividend"
          value={`$${Number(year5?.annualDividend || 0).toFixed(2)}`}
          positive
        />

        <SnowballCard
          title="Year 10 Annual Dividend"
          value={`$${Number(year10?.annualDividend || 0).toFixed(2)}`}
          positive
        />

        <SnowballCard
          title={`Year ${years} Annual Dividend`}
          value={`$${Number(finalYear?.annualDividend || 0).toFixed(2)}`}
          positive
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="mb-4 font-bold">Dividend Income Growth</h3>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="annualDividend"
                name="Annual Dividend"
                stroke="#10b981"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="monthlyIncome"
                name="Monthly Income"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="p-3">Year</th>
              <th className="p-3">Portfolio Value</th>
              <th className="p-3">Annual Dividend</th>
              <th className="p-3">Monthly Income</th>
            </tr>
          </thead>

          <tbody>
            {projectionData.map((item) => (
              <tr key={item.year} className="border-b border-slate-800">
                <td className="p-3">Year {item.year}</td>

                <td className="p-3">
                  ${Number(item.portfolioValue || 0).toLocaleString()}
                </td>

                <td className="p-3 font-semibold text-emerald-400">
                  ${Number(item.annualDividend || 0).toLocaleString()}
                </td>

                <td className="p-3 font-semibold text-blue-400">
                  ${Number(item.monthlyIncome || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

function SnowballCard({ title, value, positive }) {
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

export default DividendSnowballSimulator;
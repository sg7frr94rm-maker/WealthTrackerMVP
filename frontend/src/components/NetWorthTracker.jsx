import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  getNetWorthSettings,
  updateNetWorthSettings,
} from "../api/portfolioApi";

import NetWorthHistory from "./NetWorthHistory";

function NetWorthTracker({ investmentValue }) {
  const [cash, setCash] = useState(10000);
  const [cpf, setCpf] = useState(50000);
  const [otherAssets, setOtherAssets] = useState(0);
  const [loans, setLoans] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadNetWorth = async () => {
      const res = await getNetWorthSettings();

      setCash(res.data.cash);
      setCpf(res.data.cpf);
      setOtherAssets(res.data.otherAssets);
      setLoans(res.data.loans);
    };

    loadNetWorth();
  }, []);

  const totalAssets = investmentValue + cash + cpf + otherAssets;
  const totalLiabilities = loans;
  const netWorth = totalAssets - totalLiabilities;

  const allocationData = [
    { name: "Investments", value: investmentValue },
    { name: "Cash", value: cash },
    { name: "CPF", value: cpf },
    { name: "Other Assets", value: otherAssets },
  ].filter((item) => item.value > 0);

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

  const handleSave = async () => {
    await updateNetWorthSettings({
      cash,
      cpf,
      otherAssets,
      loans,
    });

    setStatus("Saved");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Net Worth Tracker</h2>
          <p className="mt-1 text-sm text-slate-400">
            Track your total assets, liabilities, and overall net worth.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold hover:bg-emerald-500"
        >
          {status || "Save Net Worth"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InputBox label="Cash Savings" value={cash} onChange={setCash} />
        <InputBox label="CPF / Retirement Funds" value={cpf} onChange={setCpf} />
        <InputBox label="Other Assets" value={otherAssets} onChange={setOtherAssets} />
        <InputBox label="Loans / Liabilities" value={loans} onChange={setLoans} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <NetWorthCard
          title="Investment Portfolio"
          value={`$${investmentValue.toFixed(2)}`}
          positive
        />

        <NetWorthCard
          title="Total Assets"
          value={`$${totalAssets.toFixed(2)}`}
          positive
        />

        <NetWorthCard
          title="Total Liabilities"
          value={`$${totalLiabilities.toFixed(2)}`}
          negative={totalLiabilities > 0}
        />

        <NetWorthCard
          title="Net Worth"
          value={`$${netWorth.toFixed(2)}`}
          positive={netWorth >= 0}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="mb-4 text-lg font-bold">Net Worth Allocation</h3>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  innerRadius={60}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {allocationData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="mb-4 text-lg font-bold">Asset Breakdown</h3>

          <div className="space-y-5">
            {allocationData.map((item) => {
              const percent =
                totalAssets > 0 ? (item.value / totalAssets) * 100 : 0;

              return (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between">
                    <span>{item.name}</span>

                    <span className="font-semibold">
                      ${item.value.toLocaleString()} ({percent.toFixed(2)}%)
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NetWorthHistory
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
      />

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="font-bold">Net Worth Insight</h3>

        <p className="mt-2 text-sm text-slate-400">
          Your investment portfolio is one part of your total net worth.
          Tracking cash, CPF, other assets, and liabilities gives a clearer
          picture of your overall financial position.
        </p>
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

function NetWorthCard({ title, value, positive, negative }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          negative
            ? "text-red-400"
            : positive
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default NetWorthTracker;
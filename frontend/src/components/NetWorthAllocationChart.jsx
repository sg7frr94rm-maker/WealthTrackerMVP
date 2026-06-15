import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function NetWorthAllocationChart({
  investmentValue,
  cash,
  cpf,
  otherAssets,
  loans,
}) {
  const totalAssets =
    Number(investmentValue || 0) +
    Number(cash || 0) +
    Number(cpf || 0) +
    Number(otherAssets || 0);
  const netWorth = totalAssets - Number(loans || 0);

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const data = [
    {
      name: "Investment Portfolio",
      value: Number(investmentValue || 0),
    },
    {
      name: "Cash Savings",
      value: Number(cash || 0),
    },
    {
      name: "CPF / Retirement Funds",
      value: Number(cpf || 0),
    },
    {
      name: "Other Assets",
      value: Number(otherAssets || 0),
    },
  ].filter((item) => item.value > 0);

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Net Worth Allocation</h2>
          <p className="mt-1 text-sm text-slate-400">
            Visual breakdown of your asset composition.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-3xl font-bold text-emerald-400">
            {money(netWorth)}
          </p>
          <p className="text-sm text-slate-400">Net Worth</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[320px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-5">
          {data.map((item) => {
            const percent =
              totalAssets > 0 ? (item.value / totalAssets) * 100 : 0;

            return (
              <div key={item.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="font-semibold text-white">
                    {money(item.value)} / {percent.toFixed(2)}%
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Liabilities</p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              {money(loans)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NetWorthAllocationChart;
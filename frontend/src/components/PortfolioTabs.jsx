import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import Watchlist from "./Watchlist";
import RebalancingPlanner from "./RebalancingPlanner";
import ChartCard from "./ChartCard";
import DataTable, { Th, Td } from "./DataTable";
import Input from "./Input";

function PortfolioTabs({
  performance,
  transactions,
  totalValue,
  allocationData,
  assetTypeData,
  colors,
  form,
  setForm,
  editingId,
  handleChange,
  handleSubmit,
  handleEdit,
  handleDelete,
}) {
  const [activeTab, setActiveTab] = useState("watchlist");

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Portfolio Management</h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage holdings, allocations, transactions and rebalancing.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["watchlist", "rebalancing", "allocation", "holdings", "transactions"].map(
          (tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "watchlist"
                ? "Watchlist"
                : tab === "rebalancing"
                ? "Rebalancing"
                : tab === "allocation"
                ? "Allocation"
                : tab === "holdings"
                ? "Holdings"
                : "Transactions"}
            </TabButton>
          )
        )}
      </div>

      {activeTab === "watchlist" && <Watchlist />}

      {activeTab === "rebalancing" && (
        <RebalancingPlanner performance={performance} totalValue={totalValue} />
      )}

      {activeTab === "allocation" && (
        <>
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Portfolio Allocation">
              <ResponsiveContainer width="100%" height={300}>
              <PieChart width={420} height={300}>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Asset Type Allocation">
              <PieChart width={420} height={300}>
                <Pie
                  data={assetTypeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={100}
                  label
                >
                  {assetTypeData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartCard>
          </section>

          <section className="mb-8">
            <ChartCard title="Invested vs Current Value">
              <div className="h-[320px] w-full">
                <ResponsiveContainer>
                  <BarChart data={performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="symbol" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalInvested" name="Invested" fill="#818cf8" />
                    <Bar dataKey="currentValue" name="Current Value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </section>
        </>
      )}

      {activeTab === "holdings" && (
        <DataTable title="Holdings">
          <thead className="bg-slate-800">
            <tr>
              <Th>Symbol</Th>
              <Th>Type</Th>
              <Th>Units</Th>
              <Th>Avg Cost</Th>
              <Th>Current Price</Th>
              <Th>Current Value</Th>
              <Th>Profit/Loss</Th>
              <Th>Return %</Th>
              <Th>Allocation</Th>
            </tr>
          </thead>

          <tbody>
            {performance.map((item) => (
              <tr key={item.symbol} className="border-t border-slate-800">
                <Td>
                  <div className="text-left">
                    <div className="font-semibold text-slate-100">
                      {item.symbol}
                    </div>
                    <div
                      title={item.name || item.symbol}
                      className="mt-1 max-w-[260px] truncate text-xs text-slate-400"
                    >
                      {item.name || item.symbol}
                    </div>
                  </div>
                </Td>
                <Td>{item.type || "ETF"}</Td>
                <Td>{item.totalUnits}</Td>
                <Td>${item.averageCost}</Td>
                <Td>${item.currentPrice}</Td>
                <Td>${item.currentValue.toFixed(2)}</Td>
                <Td positive={item.profitLoss >= 0}>
                  ${item.profitLoss.toFixed(2)}
                </Td>
                <Td positive={item.profitLossPercent >= 0}>
                  {item.profitLossPercent.toFixed(2)}%
                </Td>
                <Td>
                  {totalValue > 0
                    ? ((item.currentValue / totalValue) * 100).toFixed(2)
                    : 0}
                  %
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      {activeTab === "transactions" && (
        <>
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
              <Input
                name="symbol"
                placeholder="Symbol e.g. FKIQX"
                value={form.symbol}
                onChange={handleChange}
              />

              <div className="flex rounded-xl bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "ETF" })}
                  className={`flex-1 rounded-lg py-3 font-semibold ${
                    form.type === "ETF"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  ETF
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "Mutual Fund" })}
                  className={`flex-1 rounded-lg py-3 font-semibold ${
                    form.type === "Mutual Fund"
                      ? "bg-violet-600 text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Mutual Fund
                </button>
              </div>

              <Input
                name="units"
                type="number"
                step="0.01"
                placeholder="Units"
                value={form.units}
                onChange={handleChange}
              />

              <Input
                name="buyPrice"
                type="number"
                step="0.01"
                placeholder="Buy Price"
                value={form.buyPrice}
                onChange={handleChange}
              />

              <Input
                name="buyDate"
                type="date"
                value={form.buyDate}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="h-12 rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
              >
                {editingId ? "Save Changes" : "Add"}
              </button>
            </form>
          </section>

          <DataTable title="Transaction History">
            <thead className="bg-slate-800">
              <tr>
                <Th>Symbol</Th>
                <Th>Type</Th>
                <Th>Units</Th>
                <Th>Buy Price</Th>
                <Th>Buy Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-slate-800">
                  <Td>{tx.symbol}</Td>
                  <Td>{tx.type || "ETF"}</Td>
                  <Td>{tx.units}</Td>
                  <Td>${tx.buyPrice}</Td>
                  <Td>{tx.buyDate}</Td>
                  <Td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="rounded-md bg-slate-700 px-3 py-1 hover:bg-slate-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="rounded-md bg-red-600 px-3 py-1 hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </>
      )}
    </section>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 font-semibold transition-all duration-300 ${
        active
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-700/40"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default PortfolioTabs;
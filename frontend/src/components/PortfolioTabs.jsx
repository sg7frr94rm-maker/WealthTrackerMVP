import { useState } from "react";
import Watchlist from "./Watchlist";
import DividendIncomeGoal from "./DividendIncomeGoal";
import DividendForecast from "./DividendForecast";
import DividendGoalProjection from "./DividendGoalProjection";
import DividendCalendar from "./DividendCalendar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
  monthlyPassiveIncome,
  totalDividends,
  dividendForm,
  handleDividendChange,
  handleDividendSubmit,
  dividends,
  handleDividendDelete,
}) {
  const [activeTab, setActiveTab] = useState("holdingsTransactions");
  const [incomeTab, setIncomeTab] = useState("dividend");

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const number = (value, digits = 2) =>
    Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const formatDateTime = (date) =>
    date
      ? new Date(date).toLocaleString("en-SG", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Portfolio Management</h2>

        <p className="mt-1 text-sm text-slate-400">
          Manage holdings, allocation, portfolio strategy, dividends and income.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "holdingsTransactions"}
          onClick={() => setActiveTab("holdingsTransactions")}
        >
          Holdings & Transactions
        </TabButton>

        <TabButton
          active={activeTab === "allocation"}
          onClick={() => setActiveTab("allocation")}
        >
          Allocation
        </TabButton>

        <TabButton
          active={activeTab === "strategy"}
          onClick={() => setActiveTab("strategy")}
        >
          Portfolio Strategy
        </TabButton>

        <TabButton
          active={activeTab === "income"}
          onClick={() => setActiveTab("income")}
        >
          Income & Dividends
        </TabButton>
      </div>

      {activeTab === "holdingsTransactions" && (
        <div className="space-y-8">
          <SectionCard
            title="Holdings Summary"
            subtitle="Current positions generated from your transaction records."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <Th>Symbol</Th>
                    <Th>Type</Th>
                    <Th>Units</Th>
                    <Th>Avg Cost</Th>
                    <Th>Current Price</Th>
                    <Th>Source</Th>
                    <Th>Status</Th>
                    <Th>Last Updated</Th>
                    <Th>Current Value</Th>
                    <Th>P/L</Th>
                  </tr>
                </thead>

                <tbody>
                  {performance.map((item) => (
                    <tr key={item.symbol} className="border-t border-slate-800">
                      <Td>{item.symbol}</Td>
                      <Td>{item.type}</Td>
                      <Td>{number(item.totalUnits, 2)}</Td>
                      <Td>{money(item.averageCost)}</Td>
                      <Td>{money(item.currentPrice)}</Td>
                      <Td>{item.priceSource || "-"}</Td>
                      <Td>
                        <PriceStatusBadge status={item.priceStatus} />
                      </Td>
                      <Td>{formatDateTime(item.priceUpdatedAt)}</Td>
                      <Td>{money(item.currentValue)}</Td>
                      <Td positive={item.profitLoss >= 0}>
                        {money(item.profitLoss)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title={editingId ? "Edit Transaction" : "Add Transaction"}
            subtitle="Record ETF or mutual fund purchases."
          >
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <Input
                name="symbol"
                placeholder="Symbol e.g. FKIQX"
                value={form.symbol}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 rounded-lg bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "ETF" })}
                  className={`rounded-md px-4 py-3 font-semibold ${
                    form.type === "ETF"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300"
                  }`}
                >
                  ETF
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "Mutual Fund" })}
                  className={`rounded-md px-4 py-3 font-semibold ${
                    form.type === "Mutual Fund"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300"
                  }`}
                >
                  Mutual Fund
                </button>
              </div>

              <Input
                name="units"
                type="number"
                step="0.001"
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
                {editingId ? "Update" : "Add"}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title="Transaction History"
            subtitle="Review, edit or delete transaction records."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
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
                      <Td>{tx.type}</Td>
                      <Td>{number(tx.units, 3)}</Td>
                      <Td>{money(tx.buyPrice)}</Td>
                      <Td>{tx.buyDate}</Td>
                      <Td>
                        <div className="flex gap-2">
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
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "allocation" && (
        <SectionCard
          title="Portfolio Allocation"
          subtitle="View allocation by holding and asset type."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Holding Allocation">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >
                    {allocationData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => [money(value), "Value"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Asset Type Allocation">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={assetTypeData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >
                    {assetTypeData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => [money(value), "Value"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-6">
            <ChartCard title="Invested vs Current Value">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="symbol" stroke="#94a3b8" />

                  <YAxis
                    stroke="#94a3b8"
                    tickFormatter={(value) =>
                      Number(value || 0).toLocaleString("en-SG")
                    }
                  />

                  <Tooltip formatter={(value) => [money(value), "Value"]} />
                  <Legend />

                  <Bar dataKey="totalInvested" name="Invested" fill="#818cf8" />
                  <Bar
                    dataKey="currentValue"
                    name="Current Value"
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </SectionCard>
      )}

      {activeTab === "strategy" && (
        <div className="space-y-8">
          <SectionCard
            title="Portfolio Strategy"
            subtitle="Review concentration risk, rebalancing needs and watchlist ideas."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {performance.map((item) => {
                const allocation =
                  totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0;

                return (
                  <div
                    key={item.symbol}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="mb-2 flex justify-between">
                      <h3 className="font-bold">{item.symbol}</h3>

                      <span
                        className={
                          allocation > 40
                            ? "text-red-400"
                            : "text-emerald-400"
                        }
                      >
                        {allocation.toFixed(2)}%
                      </span>
                    </div>

                    <p className="text-sm text-slate-400">
                      {allocation > 40
                        ? "This holding is above 40% of your portfolio. Review concentration risk."
                        : "Allocation appears manageable."}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <Watchlist />
        </div>
      )}

      {activeTab === "income" && (
        <div className="space-y-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <TabButton
              active={incomeTab === "dividend"}
              onClick={() => setIncomeTab("dividend")}
            >
              Dividend Management
            </TabButton>

            <TabButton
              active={incomeTab === "forecast"}
              onClick={() => setIncomeTab("forecast")}
            >
              Dividend Forecast
            </TabButton>

            <TabButton
              active={incomeTab === "goal"}
              onClick={() => setIncomeTab("goal")}
            >
              Dividend Goal
            </TabButton>

            <TabButton
              active={incomeTab === "calendar"}
              onClick={() => setIncomeTab("calendar")}
            >
              Dividend Calendar
            </TabButton>
          </div>

          {incomeTab === "dividend" && (
            <SectionCard
              title="Dividend Management"
              subtitle="Record dividend payouts and review your dividend history."
            >
              <form
                onSubmit={handleDividendSubmit}
                className="mb-8 grid gap-4 md:grid-cols-4"
              >
                <Input
                  name="symbol"
                  placeholder="Symbol"
                  value={dividendForm.symbol}
                  onChange={handleDividendChange}
                />

                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Dividend Amount"
                  value={dividendForm.amount}
                  onChange={handleDividendChange}
                />

                <Input
                  name="date"
                  type="date"
                  value={dividendForm.date}
                  onChange={handleDividendChange}
                />

                <button
                  type="submit"
                  className="h-12 rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500"
                >
                  Add Dividend
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <Th>Symbol</Th>
                      <Th>Amount</Th>
                      <Th>Date</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {dividends.length === 0 ? (
                      <tr className="border-t border-slate-800">
                        <Td>No dividend records yet.</Td>
                        <Td></Td>
                        <Td></Td>
                        <Td></Td>
                      </tr>
                    ) : (
                      dividends.map((dividend) => (
                        <tr
                          key={dividend.id}
                          className="border-t border-slate-800"
                        >
                          <Td>{dividend.symbol}</Td>
                          <Td positive>{money(dividend.amount)}</Td>
                          <Td>{dividend.date}</Td>
                          <Td>
                            <button
                              onClick={() =>
                                handleDividendDelete(dividend.id)
                              }
                              className="rounded-md bg-red-600 px-3 py-1 hover:bg-red-500"
                            >
                              Delete
                            </button>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {incomeTab === "forecast" && (
            <SectionCard
              title="Dividend Forecast"
              subtitle="Estimate dividend income using historical and upcoming dividend data."
            >
              <DividendIncomeGoal
                monthlyPassiveIncome={monthlyPassiveIncome}
                monthlyIncomeGoal={100}
              />

              <DividendForecast />
            </SectionCard>
          )}

          {incomeTab === "goal" && (
            <SectionCard
              title="Dividend Goal"
              subtitle="Estimate how long it may take to reach your passive dividend target."
            >
              <DividendGoalProjection
                currentMonthlyIncome={monthlyPassiveIncome}
                currentPortfolioValue={totalValue}
              />
            </SectionCard>
          )}

          {incomeTab === "calendar" && (
            <SectionCard
              title="Dividend Calendar"
              subtitle="Track upcoming dividend events and declared distributions."
            >
              <DividendCalendar />
            </SectionCard>
          )}
        </div>
      )}
    </section>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      {children}
    </section>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-4 font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-semibold whitespace-nowrap">{children}</th>;
}

function Td({ children, positive }) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 ${
        positive === true
          ? "text-emerald-400"
          : positive === false
          ? "text-red-400"
          : ""
      }`}
    >
      {children}
    </td>
  );
}

function PriceStatusBadge({ status }) {
  const normalizedStatus = status || "Unknown";

  const className =
    normalizedStatus === "Live"
      ? "bg-emerald-900 text-emerald-300"
      : normalizedStatus === "Manual"
      ? "bg-blue-900 text-blue-300"
      : normalizedStatus === "Fallback"
      ? "bg-yellow-900 text-yellow-300"
      : "bg-slate-800 text-slate-300";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {normalizedStatus}
    </span>
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
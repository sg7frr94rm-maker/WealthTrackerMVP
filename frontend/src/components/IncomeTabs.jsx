import { useState } from "react";
import DividendIncomeGoal from "./DividendIncomeGoal";
import DividendForecast from "./DividendForecast";
import DividendGoalProjection from "./DividendGoalProjection";
import DividendSnowballSimulator from "./DividendSnowballSimulator";
import DividendCalendar from "./DividendCalendar";
import Input from "./Input";
import DataTable, { Th, Td } from "./DataTable";

function IncomeTabs({
  monthlyPassiveIncome,
  totalDividends,
  totalValue,
  dividendForm,
  handleDividendChange,
  handleDividendSubmit,
  dividends,
  handleDividendDelete,
}) {
  const [activeTab, setActiveTab] = useState("record");
  const [planningTab, setPlanningTab] = useState("forecast");

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Income</h2>
        <p className="mt-1 text-sm text-slate-400">
          Record dividends, review income history, and plan future passive income.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton active={activeTab === "record"} onClick={() => setActiveTab("record")}>
          Record Dividend
        </TabButton>

        <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
          Dividend History
        </TabButton>

        <TabButton active={activeTab === "planning"} onClick={() => setActiveTab("planning")}>
          Income Planning
        </TabButton>
      </div>

      {activeTab === "record" && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <h2 className="mb-5 text-xl font-bold">Record Dividend Income</h2>

          <form onSubmit={handleDividendSubmit} className="grid gap-4 md:grid-cols-4">
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
        </section>
      )}

      {activeTab === "history" && (
        <DataTable title="Dividend History">
          <thead className="bg-slate-800">
            <tr>
              <Th>Symbol</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {dividends.map((dividend) => (
              <tr key={dividend.id} className="border-t border-slate-800">
                <Td>{dividend.symbol}</Td>
                <Td positive>${dividend.amount.toFixed(2)}</Td>
                <Td>{dividend.date}</Td>
                <Td>
                  <button
                    onClick={() => handleDividendDelete(dividend.id)}
                    className="rounded-md bg-red-600 px-3 py-1 hover:bg-red-500"
                  >
                    Delete
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      {activeTab === "planning" && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Income Planning</h2>
            <p className="mt-1 text-sm text-slate-400">
              Forecast dividends, project income goals, and simulate dividend snowball growth.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <TabButton active={planningTab === "forecast"} onClick={() => setPlanningTab("forecast")}>
              Forecast
            </TabButton>

            <TabButton active={planningTab === "projection"} onClick={() => setPlanningTab("projection")}>
              Goal Projection
            </TabButton>

            <TabButton active={planningTab === "snowball"} onClick={() => setPlanningTab("snowball")}>
              Snowball
            </TabButton>

            <TabButton active={planningTab === "calendar"} onClick={() => setPlanningTab("calendar")}>
              Calendar
            </TabButton>
          </div>

          {planningTab === "forecast" && (
            <>
              <DividendIncomeGoal
                monthlyPassiveIncome={monthlyPassiveIncome}
                monthlyIncomeGoal={100}
              />

              <DividendForecast />
            </>
          )}

          {planningTab === "projection" && (
            <DividendGoalProjection
              currentMonthlyIncome={monthlyPassiveIncome}
              currentPortfolioValue={totalValue}
            />
          )}

          {planningTab === "snowball" && (
            <DividendSnowballSimulator
              currentAnnualDividend={totalDividends}
              currentPortfolioValue={totalValue}
            />
          )}

          {planningTab === "calendar" && <DividendCalendar />}
        </section>
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

export default IncomeTabs;
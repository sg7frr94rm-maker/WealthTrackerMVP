import { useState } from "react";

import NetWorthTracker from "./NetWorthTracker";
import PortfolioStressTest from "./PortfolioStressTest";
import ChartCard from "./ChartCard";
import NetWorthAllocationChart from "./NetWorthAllocationChart";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function WealthTabs({
  totalValue,
  portfolioGoal,
  trendData,
  netWorth,
  cash,
  cpf,
  otherAssets,
  loans,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Wealth Management
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Track net worth, stress-test your portfolio and review long-term wealth growth.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </TabButton>

        <TabButton
          active={activeTab === "stress"}
          onClick={() => setActiveTab("stress")}
        >
          Stress Test
        </TabButton>

        <TabButton
          active={activeTab === "growth"}
          onClick={() => setActiveTab("growth")}
        >
          Growth Trend
        </TabButton>
      </div>

      {activeTab === "overview" && (
      <>
        <NetWorthAllocationChart
          investmentValue={totalValue}
          cash={cash}
          cpf={cpf}
          otherAssets={otherAssets}
          loans={loans}
        />
    
        <NetWorthTracker
          investmentValue={totalValue}
        />
        </>
      )}

      {activeTab === "stress" && (
        <PortfolioStressTest
          portfolioValue={totalValue}
          netWorth={netWorth}
          portfolioGoal={portfolioGoal}
          fireNumber={900000}
        />
      )}

      {activeTab === "growth" && (
        <ChartCard title="Portfolio Growth Trend">
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  name="Portfolio Value"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </section>
  );
}

function TabButton({
  children,
  active,
  onClick,
}) {
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

export default WealthTabs;
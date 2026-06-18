import { useState } from "react";
import WealthDashboardSummary from "./WealthDashboardSummary";
import PortfolioAssistant from "./PortfolioAssistant";
import PortfolioInsightsPanel from "./PortfolioInsightsPanel";
import InsightCard from "./InsightCard";
import HealthBar from "./HealthBar";
import DynamicOpportunities from "./DynamicOpportunities";

function DashboardInsightsTabs({
  performance,
  totalValue,
  netWorth,
  monthlyPassiveIncome,
  monthlyIncomeGoal,
  dividendCalendar,
  totalDividends,
  portfolioGoal,
  fireNumber,
  yieldOnCost,
  strengths,
  opportunities,
  riskLevel,
  overallHealthScore,
  diversificationScore,
  incomeScore,
  goalScore,
  largestPosition,
  bestPerformer,
  worstPerformer,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const allReturnsZero =
    performance.length > 1 &&
    performance.every(
      (item) => Math.abs(Number(item.profitLossPercent || 0)) < 0.01
    );

  const nextDividend = [...dividendCalendar]
    .filter((item) => new Date(item.expectedDate) >= new Date())
    .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate))[0];

  const uniqueAssetTypes = new Set(
    performance.map((item) => item.assetType || item.type)
  ).size;

  const largestAllocation =
    largestPosition && totalValue > 0
      ? ((largestPosition.currentValue / totalValue) * 100).toFixed(2)
      : 0;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Wealth Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Monitor portfolio overview, opportunities, health score, insights and recommendations.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
          Overview
        </TabButton>

        <TabButton active={activeTab === "opportunities"} onClick={() => setActiveTab("opportunities")}>
          Opportunities
        </TabButton>

        <TabButton active={activeTab === "healthInsights"} onClick={() => setActiveTab("healthInsights")}>
          Health & Insights
        </TabButton>

        <TabButton active={activeTab === "assistant"} onClick={() => setActiveTab("assistant")}>
          Assistant
        </TabButton>
      </div>

      {activeTab === "overview" && (
        <WealthDashboardSummary
          netWorth={netWorth}
          portfolioValue={totalValue}
          portfolioGoal={portfolioGoal}
          monthlyPassiveIncome={monthlyPassiveIncome}
          monthlyIncomeGoal={monthlyIncomeGoal}
          fireNumber={fireNumber}
          totalDividends={totalDividends}
          dividendCalendar={dividendCalendar}
          performance={performance}
        />
      )}

      {activeTab === "opportunities" && (
        <DynamicOpportunities
          performance={performance}
          totalValue={totalValue}
          yieldOnCost={yieldOnCost}
          monthlyPassiveIncome={monthlyPassiveIncome}
          monthlyIncomeGoal={monthlyIncomeGoal}
          portfolioGoal={portfolioGoal}
        />
      )}

      {activeTab === "healthInsights" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Portfolio Health Score</h2>
                <p className="mt-1 text-sm text-slate-400">{riskLevel}</p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-4xl font-bold text-emerald-400">
                  {overallHealthScore}/100
                </p>
                <p className="text-sm text-slate-400">Overall Score</p>
              </div>
            </div>

            <div className="space-y-5">
              <HealthBar label="Diversification" score={diversificationScore} />
              <HealthBar label="Income Generation" score={incomeScore} />
              <HealthBar label="Goal Progress" score={goalScore} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold">Portfolio Insights</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InsightCard
                label="Largest Position"
                value={
                  largestPosition && totalValue > 0
                    ? `${largestPosition.symbol} — ${largestAllocation}%`
                    : "-"
                }
              />

              {!allReturnsZero && (
                <>
                  <InsightCard
                    label="Best Performer"
                    value={
                      bestPerformer
                        ? `${bestPerformer.symbol} — ${bestPerformer.profitLossPercent.toFixed(2)}%`
                        : "-"
                    }
                    positive
                  />

                  <InsightCard
                    label="Worst Performer"
                    value={
                      worstPerformer
                        ? `${worstPerformer.symbol} — ${worstPerformer.profitLossPercent.toFixed(2)}%`
                        : "-"
                    }
                    positive={worstPerformer?.profitLossPercent >= 0}
                  />
                </>
              )}

              <InsightCard
                label="Next Dividend"
                value={
                  nextDividend
                    ? `${nextDividend.symbol} — $${Number(nextDividend.expectedAmount).toFixed(2)}`
                    : "No Upcoming Dividend"
                }
                positive
              />

              <InsightCard
                label="Diversification"
                value={`${performance.length} Holdings • ${uniqueAssetTypes} Asset Types`}
              />

              <InsightCard
                label="Rebalancing Status"
                value={largestAllocation > 40 ? "Review Allocation" : "Healthy Allocation"}
                positive={largestAllocation <= 40}
              />

              <InsightCard
                label="Goal Progress"
                value={`${
                  portfolioGoal > 0
                    ? ((totalValue / portfolioGoal) * 100).toFixed(2)
                    : "0.00"
                }%`}
                positive
              />

              <InsightCard
                label="Monthly Passive Income"
                value={`$${monthlyPassiveIncome.toFixed(2)}`}
                positive
              />
            </div>
          </section>
        </div>
      )}

      {activeTab === "assistant" && (
        <div className="space-y-6">
          <PortfolioAssistant
            totalValue={totalValue}
            totalDividends={totalDividends}
            monthlyPassiveIncome={monthlyPassiveIncome}
            portfolioGoal={portfolioGoal}
            performance={performance}
          />

          <PortfolioInsightsPanel
            strengths={strengths}
            opportunities={opportunities}
          />
        </div>
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

export default DashboardInsightsTabs;
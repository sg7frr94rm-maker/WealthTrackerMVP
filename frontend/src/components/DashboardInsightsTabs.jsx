import { useState } from "react";
import InsightCard from "./InsightCard";
import HealthBar from "./HealthBar";
import AIPortfolioInsights from "./AIPortfolioInsights";

function DashboardInsightsTabs({
  performance = [],
  totalValue = 0,
  monthlyPassiveIncome = 0,
  dividendCalendar = [],
  totalDividends = 0,
  portfolioGoal,
  yieldOnCost,
  riskLevel,
  overallHealthScore,
  diversificationScore,
  incomeScore,
  goalScore,
  largestPosition,
  bestPerformer,
  worstPerformer,
}) {
  const [activeInsightTab, setActiveInsightTab] = useState("review");

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
      ? (Number(largestPosition.currentValue || 0) / Number(totalValue || 0)) *
        100
      : 0;

  const dividendYield =
    totalValue > 0
      ? (Number(totalDividends || 0) / Number(totalValue || 0)) * 100
      : 0;

  const monthlyIncomeGoal = 100;

  const incomeGap = Math.max(
    0,
    monthlyIncomeGoal - Number(monthlyPassiveIncome || 0)
  );

  const suggestedAction =
    largestAllocation > 40
      ? `Reduce ${largestPosition?.symbol || "largest holding"} concentration`
      : incomeGap > 20
      ? "Increase income-producing assets"
      : "Portfolio allocation looks healthy";

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Portfolio Insights</h2>
        <p className="mt-1 text-sm text-slate-400">
          Review portfolio health, key metrics and AI-generated analysis.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeInsightTab === "review"}
          onClick={() => setActiveInsightTab("review")}
        >
          Portfolio Review
        </TabButton>

        <TabButton
          active={activeInsightTab === "ai"}
          onClick={() => setActiveInsightTab("ai")}
        >
          AI Analysis
        </TabButton>
      </div>

      {activeInsightTab === "review" && (
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
            <h2 className="mb-5 text-xl font-bold">Portfolio Snapshot</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!allReturnsZero && (
                <InsightCard
                  label="Worst Performer"
                  value={
                    worstPerformer
                      ? `${worstPerformer.symbol} — ${Number(
                          worstPerformer.profitLossPercent || 0
                        ).toFixed(2)}%`
                      : "-"
                  }
                  positive={Number(worstPerformer?.profitLossPercent || 0) >= 0}
                />
              )}

              <InsightCard
                label="Next Dividend"
                value={
                  nextDividend
                    ? `${nextDividend.symbol} — ${money(
                        nextDividend.expectedAmount
                      )}`
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
                value={
                  largestAllocation > 40
                    ? "Review Allocation"
                    : "Healthy Allocation"
                }
                positive={largestAllocation <= 40}
              />

              <InsightCard
                label="Dividend Yield"
                value={`${dividendYield.toFixed(2)}%`}
                positive={dividendYield >= 1}
              />

              <InsightCard
                label="Income Goal Gap"
                value={`${money(incomeGap)}/month`}
                positive={incomeGap <= 0}
              />

              <InsightCard
                label="Portfolio Concentration"
                value={
                  largestPosition
                    ? `${largestPosition.symbol} — ${largestAllocation.toFixed(
                        2
                      )}%`
                    : "-"
                }
                positive={largestAllocation < 40}
              />

              <InsightCard
                label="Suggested Action"
                value={suggestedAction}
                positive={largestAllocation <= 40}
              />
            </div>
          </section>
        </div>
      )}

      {activeInsightTab === "ai" && (
        <AIPortfolioInsights
          totalValue={totalValue}
          totalDividends={totalDividends}
          monthlyPassiveIncome={monthlyPassiveIncome}
          portfolioGoal={portfolioGoal}
          yieldOnCost={yieldOnCost}
          performance={performance}
        />
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
import { useState } from "react";
import PortfolioGoalEditor from "./PortfolioGoalEditor";
import ProjectionCalculator from "./ProjectionCalculator";
import YearsToGoal from "./YearsToGoal";
import RebalancingPlanner from "./RebalancingPlanner";
import PortfolioStressTest from "./PortfolioStressTest";

function GoalsTabs({
  portfolioGoal,
  totalValue,
  netWorth,
  goalProgress,
  updatePortfolioGoal,
  fetchData,
  performance,
}) {
  const [activeTab, setActiveTab] = useState("goal");

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Goal Planning
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Manage portfolio goals, projections and rebalancing.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "goal"}
          onClick={() => setActiveTab("goal")}
        >
          Goal Progress
        </TabButton>

        <TabButton
          active={activeTab === "projection"}
          onClick={() => setActiveTab("projection")}
        >
          Projection
        </TabButton>

        <TabButton
          active={activeTab === "stress"}
          onClick={() => setActiveTab("stress")}
        >
          Stress Test
        </TabButton>

        <TabButton
          active={activeTab === "rebalance"}
          onClick={() => setActiveTab("rebalance")}
        >
          Rebalancing
        </TabButton>
      </div>

      {/* GOAL */}
      {activeTab === "goal" && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Portfolio Goal
              </h2>

              <p className="mt-2 text-slate-400">
                Target: ${portfolioGoal.toLocaleString()}
              </p>

              <p className="text-slate-400">
                Current: ${totalValue.toFixed(2)}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-emerald-400">
                {goalProgress.toFixed(2)}%
              </p>

              <p className="text-sm text-slate-400">
                Progress
              </p>
            </div>
          </div>

          <div className="mt-5 h-4 w-full rounded-full bg-slate-800">
            <div
              className="h-4 rounded-full bg-emerald-500"
              style={{
                width: `${Math.min(goalProgress, 100)}%`,
              }}
            />
          </div>

          <PortfolioGoalEditor
            portfolioGoal={portfolioGoal}
            updatePortfolioGoal={updatePortfolioGoal}
            onSaved={fetchData}
          />
          
          <div className="mt-8">
            <YearsToGoal
              currentValue={totalValue}
              portfolioGoal={portfolioGoal}
            />
          </div>
        </section>
      )}

      {/* PROJECTION */}
      {activeTab === "projection" && (
          <ProjectionCalculator
            currentValue={totalValue}
            portfolioGoal={portfolioGoal}
          />
      )}

      {/* STRESS TEST */}
      {activeTab === "stress" && (
          <PortfolioStressTest
            portfolioValue={totalValue}
            netWorth={netWorth}
            portfolioGoal={portfolioGoal}
          />
      )}

      {/* REBALANCING */}
      {activeTab === "rebalance" && (
        <RebalancingPlanner
          performance={performance}
          totalValue={totalValue}
          nextContribution={1000}
        />
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

export default GoalsTabs;
import { useState } from "react";
import MilestoneProgress from "./MilestoneProgress";
import MilestoneTracker from "./MilestoneTracker";
import AchievementTracker from "./AchievementTracker";

function MilestoneTabs({
  portfolioValue,
  portfolioGoal,
  totalDividends,
  monthlyPassiveIncome,
  netWorth,
  fireProgress,
}) {
  const [activeTab, setActiveTab] = useState("progress");

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Milestones & Achievements</h2>
        <p className="mt-1 text-sm text-slate-400">
          Track upcoming milestones, completed milestones, and achievement badges.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "progress"}
          onClick={() => setActiveTab("progress")}
        >
          Progress
        </TabButton>

        <TabButton
          active={activeTab === "milestones"}
          onClick={() => setActiveTab("milestones")}
        >
          Milestone Tracker
        </TabButton>

        <TabButton
          active={activeTab === "achievements"}
          onClick={() => setActiveTab("achievements")}
        >
          Achievements
        </TabButton>
      </div>

      {activeTab === "progress" && (
        <MilestoneProgress
          portfolioValue={portfolioValue}
          portfolioGoal={portfolioGoal}
          totalDividends={totalDividends}
          monthlyPassiveIncome={monthlyPassiveIncome}
          fireProgress={fireProgress}
        />
      )}

      {activeTab === "milestones" && (
        <MilestoneTracker
          portfolioValue={portfolioValue}
          netWorth={netWorth}
        />
      )}

      {activeTab === "achievements" && (
        <AchievementTracker
          portfolioValue={portfolioValue}
          netWorth={netWorth}
          totalDividends={totalDividends}
          fireProgress={fireProgress}
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

export default MilestoneTabs;
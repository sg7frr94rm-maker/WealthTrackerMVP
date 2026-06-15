import { useState } from "react";

function PortfolioGoalEditor({
  portfolioGoal,
  updatePortfolioGoal,
  onSaved,
}) {
  const [goal, setGoal] = useState(portfolioGoal);

  const saveGoal = async () => {
    await updatePortfolioGoal(Number(goal));
    onSaved();
  };

  return (
    <div className="mt-4 flex flex-col gap-3 md:flex-row">
      <input
        type="number"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4"
      />

      <button
        onClick={saveGoal}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
      >
        Update Goal
      </button>
    </div>
  );
}

export default PortfolioGoalEditor;
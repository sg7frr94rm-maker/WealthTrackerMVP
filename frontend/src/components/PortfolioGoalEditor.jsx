import { useEffect, useState } from "react";

function PortfolioGoalEditor({
  portfolioGoal,
  updatePortfolioGoal,
  onSaved,
}) {
  const [goal, setGoal] = useState(Number(portfolioGoal || 0));
  const [status, setStatus] = useState("");

  useEffect(() => {
    setGoal(Number(portfolioGoal || 0));
  }, [portfolioGoal]);

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const saveGoal = async () => {
    try {
      await updatePortfolioGoal(Number(goal || 0));
      setStatus("Saved");

      if (onSaved) {
        onSaved();
      }

      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error("Failed to update portfolio goal", error);
      setStatus("Save failed");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-4">
        <p className="text-sm text-slate-400">Current Portfolio Goal</p>

        <p className="mt-1 text-2xl font-bold text-emerald-400">
          {money(goal)}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="number"
          min="0"
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 outline-none focus:border-emerald-500"
        />

        <button
          onClick={saveGoal}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
        >
          {status || "Update Goal"}
        </button>
      </div>
    </div>
  );
}

export default PortfolioGoalEditor;
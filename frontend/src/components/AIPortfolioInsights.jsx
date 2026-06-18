import { useEffect, useState } from "react";
import { generateAiPortfolioInsights } from "../api/portfolioApi";

function AIPortfolioInsights({
  totalValue,
  totalDividends,
  monthlyPassiveIncome,
  portfolioGoal,
  yieldOnCost,
  performance,
}) {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await generateAiPortfolioInsights({
        totalValue,
        totalDividends,
        monthlyPassiveIncome,
        portfolioGoal,
        yieldOnCost,
        performance,
      });

      setAiData(response.data);
    } catch (err) {
      console.error("Failed to generate AI insights", err);
      setError("Unable to generate AI portfolio insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [
    totalValue,
    totalDividends,
    monthlyPassiveIncome,
    portfolioGoal,
    yieldOnCost,
    performance,
  ]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">AI Portfolio Analysis</h2>
          <p className="mt-1 text-sm text-slate-400">
            Structured portfolio commentary generated from your latest holdings, income and goal progress.
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Refresh Analysis"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !aiData && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
          Generating AI portfolio analysis...
        </div>
      )}

      {aiData?.executiveSummary && (
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-bold text-white">Executive Summary</h3>
            <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-300">
              Summary
            </span>
          </div>

          <p className="leading-7 text-slate-300">
            {aiData.executiveSummary}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {aiData?.insights?.map((item, index) => (
          <InsightAnalysisCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
}

function InsightAnalysisCard({ item }) {
  const priorityClass =
    item.priority === "High"
      ? "bg-red-900 text-red-300"
      : item.priority === "Medium"
      ? "bg-amber-900 text-amber-300"
      : item.priority === "Low"
      ? "bg-emerald-900 text-emerald-300"
      : "bg-slate-800 text-slate-300";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {item.category}
          </p>
          <h3 className="mt-1 font-bold text-white">
            {item.title}
          </h3>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}>
          {item.priority}
        </span>
      </div>

      <p className="text-sm leading-6 text-slate-300">
        {item.message}
      </p>
    </div>
  );
}

export default AIPortfolioInsights;
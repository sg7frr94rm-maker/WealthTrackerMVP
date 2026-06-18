function DynamicOpportunities({
  performance,
  totalValue,
  yieldOnCost,
  monthlyPassiveIncome,
  monthlyIncomeGoal,
  portfolioGoal,
}) {
  const opportunities = [];

  const largestPosition =
    performance.length > 0
      ? [...performance].sort((a, b) => b.currentValue - a.currentValue)[0]
      : null;

  const concentrationPercent =
    largestPosition && totalValue > 0
      ? (largestPosition.currentValue / totalValue) * 100
      : 0;

  const assetTypes = [...new Set(performance.map((item) => item.type || "ETF"))];

  if (concentrationPercent > 40) {
    opportunities.push({
      title: "Reduce concentration risk",
      priority: concentrationPercent > 60 ? "High" : "Medium",
      reason: `${largestPosition.symbol} represents ${concentrationPercent.toFixed(
        1
      )}% of your portfolio.`,
      suggestion: "Consider diversifying into other ETFs, REITs, bonds, or cash-like assets.",
    });
  }

  if (yieldOnCost < 2) {
    opportunities.push({
      title: "Improve dividend income",
      priority: "High",
      reason: `Your current yield on cost is ${yieldOnCost.toFixed(2)}%.`,
      suggestion: "Consider adding income-focused assets if dividend growth is part of your strategy.",
    });
  }

  if (monthlyPassiveIncome < monthlyIncomeGoal) {
    opportunities.push({
      title: "Increase passive income",
      priority: "Medium",
      reason: `You need another $${(
        monthlyIncomeGoal - monthlyPassiveIncome
      ).toFixed(2)}/month to reach your passive income goal.`,
      suggestion: "Review dividend-paying ETFs, REITs, or other income-generating assets.",
    });
  }

  if (assetTypes.length === 1) {
    opportunities.push({
      title: "Broaden asset allocation",
      priority: "Medium",
      reason: `Your portfolio currently only contains ${assetTypes[0]} assets.`,
      suggestion: "Consider adding another asset class to reduce portfolio dependency.",
    });
  }

  if (totalValue < portfolioGoal) {
    opportunities.push({
      title: "Continue building toward portfolio goal",
      priority: "Low",
      reason: `You are $${(portfolioGoal - totalValue).toFixed(
        2
      )} away from your portfolio goal.`,
      suggestion: "Maintain regular contributions and review your allocation periodically.",
    });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Dynamic Opportunities Engine</h2>
        <p className="mt-1 text-sm text-slate-400">
          Rule-based opportunities generated from your portfolio data.
        </p>
      </div>

      {opportunities.length === 0 ? (
        <p className="text-slate-400">
          No major opportunities detected. Your portfolio appears balanced based on current rules.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((item, index) => (
            <OpportunityCard key={index} item={item} index={index + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

function OpportunityCard({ item, index }) {
  const priorityClass =
    item.priority === "High"
      ? "bg-red-900 text-red-300"
      : item.priority === "Medium"
      ? "bg-amber-900 text-amber-300"
      : "bg-slate-800 text-slate-300";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-bold">
            {index}
          </span>
          <h3 className="font-bold">{item.title}</h3>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}>
          {item.priority}
        </span>
      </div>

      <p className="text-sm text-slate-400">{item.reason}</p>

      <p className="mt-3 text-sm text-slate-300">
        <span className="font-semibold text-slate-100">Suggestion: </span>
        {item.suggestion}
      </p>
    </div>
  );
}

export default DynamicOpportunities;
function PortfolioAssistant({
  totalValue,
  totalDividends,
  monthlyPassiveIncome,
  portfolioGoal,
  performance,
}) {
  const goalProgress =
    portfolioGoal > 0 ? (totalValue / portfolioGoal) * 100 : 0;

  const largestPosition = [...performance].sort(
    (a, b) => b.currentValue - a.currentValue
  )[0];

  const concentrationPercent =
    largestPosition && totalValue > 0
      ? (largestPosition.currentValue / totalValue) * 100
      : 0;

  const recommendations = [];

  if (concentrationPercent > 40) {
    recommendations.push({
      priority: "High",
      title: "Review portfolio concentration",
      message: `${largestPosition.symbol} makes up ${concentrationPercent.toFixed(
        2
      )}% of your portfolio. Consider rebalancing future contributions into other holdings.`,
      action: "Review allocation",
      color: "yellow",
    });
  }

  if (monthlyPassiveIncome < 100) {
    recommendations.push({
      priority: "High",
      title: "Grow passive income",
      message: `Your current monthly passive income is $${monthlyPassiveIncome.toFixed(
        2
      )}. You need another $${(100 - monthlyPassiveIncome).toFixed(
        2
      )}/month to reach your $100 goal.`,
      action: "Increase dividend income",
      color: "blue",
    });
  }

  if (goalProgress >= 50 && goalProgress < 100) {
    recommendations.push({
      priority: "Medium",
      title: "Portfolio goal is within reach",
      message: `You are ${goalProgress.toFixed(
        2
      )}% toward your $${portfolioGoal.toLocaleString()} portfolio goal.`,
      action: "Stay consistent",
      color: "green",
    });
  }

  if (totalDividends < 500) {
    recommendations.push({
      priority: "Medium",
      title: "Next dividend milestone",
      message: `You have collected $${totalDividends.toFixed(
        2
      )} in dividends. You need $${(500 - totalDividends).toFixed(
        2
      )} more to reach $500.`,
      action: "Track dividend growth",
      color: "green",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "Low",
      title: "Portfolio looks stable",
      message:
        "Your portfolio is currently aligned with the main goals tracked in this dashboard.",
      action: "Maintain plan",
      color: "green",
    });
  }

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Portfolio Assistant Recommendations
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Smart rule-based recommendations based on your portfolio, income and goal progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((item, index) => (
          <RecommendationCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({ item }) {
  const badgeClass =
    item.color === "green"
      ? "bg-emerald-900 text-emerald-300"
      : item.color === "blue"
      ? "bg-blue-900 text-blue-300"
      : "bg-yellow-900 text-yellow-300";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-bold">{item.title}</h3>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {item.priority}
        </span>
      </div>

      <p className="text-sm text-slate-400">{item.message}</p>

      <p className="mt-4 text-sm font-semibold text-emerald-400">
        Suggested action: {item.action}
      </p>
    </div>
  );
}

export default PortfolioAssistant;
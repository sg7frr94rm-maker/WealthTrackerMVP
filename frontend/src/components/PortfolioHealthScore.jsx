function PortfolioHealthScore({
  performance = [],
  portfolioValue = 0,
  portfolioGoal = 0,
  monthlyPassiveIncome = 0,
  monthlyIncomeGoal = 0,
}) {
  let score = 100;
  const checks = [];

  const safePortfolioValue = Number(portfolioValue || 0);
  const safePortfolioGoal = Number(portfolioGoal || 0);
  const safeMonthlyIncome = Number(monthlyPassiveIncome || 0);
  const safeMonthlyGoal = Number(monthlyIncomeGoal || 0);

  const portfolioProgress =
    safePortfolioGoal > 0 ? (safePortfolioValue / safePortfolioGoal) * 100 : 100;

  const incomeProgress =
    safeMonthlyGoal > 0 ? (safeMonthlyIncome / safeMonthlyGoal) * 100 : 100;

  const highConcentration = performance.filter((item) => {
    const allocation =
      safePortfolioValue > 0
        ? (Number(item.currentValue || 0) / safePortfolioValue) * 100
        : 0;

    return allocation > 40;
  });

  const losingHoldings = performance.filter(
    (item) => Number(item.profitLossPercent || item.totalReturnPercent || 0) < -10
  );

  const stalePrices = performance.filter((item) => {
    if (!item.priceUpdatedAt) return true;

    const updatedAt = new Date(item.priceUpdatedAt);
    const diffDays = (new Date() - updatedAt) / (1000 * 60 * 60 * 24);

    return diffDays > 7;
  });

  if (highConcentration.length > 0) {
    score -= 15;
    checks.push({
      label: "Concentration Risk",
      status: "Watch",
      detail: `${highConcentration.length} holding(s) above 40% allocation.`,
    });
  } else {
    checks.push({
      label: "Concentration Risk",
      status: "Good",
      detail: "No holding exceeds 40% allocation.",
    });
  }

  if (losingHoldings.length > 0) {
    score -= 10;
    checks.push({
      label: "Holding Performance",
      status: "Watch",
      detail: `${losingHoldings.length} holding(s) are down more than 10%.`,
    });
  } else {
    checks.push({
      label: "Holding Performance",
      status: "Good",
      detail: "No major loss signals detected.",
    });
  }

  if (stalePrices.length > 0) {
    score -= 8;
    checks.push({
      label: "Market Data",
      status: "Watch",
      detail: `${stalePrices.length} holding(s) have stale price data.`,
    });
  } else {
    checks.push({
      label: "Market Data",
      status: "Good",
      detail: "Market prices are up to date.",
    });
  }

  if (portfolioProgress < 50) {
    score -= 10;
    checks.push({
      label: "Portfolio Goal",
      status: "Watch",
      detail: "Portfolio goal progress is below 50%.",
    });
  } else {
    checks.push({
      label: "Portfolio Goal",
      status: "Good",
      detail: "Portfolio goal progress is on track.",
    });
  }

  if (incomeProgress < 50) {
    score -= 10;
    checks.push({
      label: "Income Goal",
      status: "Watch",
      detail: "Passive income progress is below 50%.",
    });
  } else {
    checks.push({
      label: "Income Goal",
      status: "Good",
      detail: "Passive income progress is on track.",
    });
  }

  score = Math.max(0, Math.min(100, score));

  const status =
    score >= 90
      ? "Excellent"
      : score >= 75
      ? "Healthy"
      : score >= 50
      ? "Watchlist"
      : "Action Required";

  const statusClass =
    score >= 90
      ? "text-emerald-300"
      : score >= 75
      ? "text-green-300"
      : score >= 50
      ? "text-yellow-300"
      : "text-red-300";

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Portfolio Health Score</h2>
          <p className="mt-1 text-sm text-slate-400">
            Combined score based on risk, goal progress, performance and data quality.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className={`text-4xl font-black ${statusClass}`}>{score}/100</p>
          <p className="text-sm font-semibold text-slate-300">{status}</p>
        </div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {checks.map((check) => (
          <div
            key={check.label}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">{check.label}</h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  check.status === "Good"
                    ? "bg-emerald-900 text-emerald-300"
                    : "bg-yellow-900 text-yellow-300"
                }`}
              >
                {check.status}
              </span>
            </div>

            <p className="text-sm text-slate-400">{check.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PortfolioHealthScore;
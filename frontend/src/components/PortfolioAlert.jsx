function PortfolioAlert({
  performance = [],
  portfolioValue = 0,
  portfolioGoal = 0,
  monthlyPassiveIncome = 0,
  monthlyIncomeGoal = 0,
}) {
  const alerts = [];

  const safePortfolioValue = Number(portfolioValue || 0);
  const safePortfolioGoal = Number(portfolioGoal || 0);
  const safeMonthlyIncome = Number(monthlyPassiveIncome || 0);
  const safeMonthlyGoal = Number(monthlyIncomeGoal || 0);

  const portfolioProgress =
    safePortfolioGoal > 0 ? (safePortfolioValue / safePortfolioGoal) * 100 : 0;

  const incomeProgress =
    safeMonthlyGoal > 0 ? (safeMonthlyIncome / safeMonthlyGoal) * 100 : 0;

  const getSymbol = (item) => item.symbol || item.ticker || "Unknown";

  const losingHoldings = performance.filter(
    (item) => Number(item.profitLossPercent || item.totalReturnPercent || 0) < -10
  );

  const highGainHoldings = performance.filter(
    (item) => Number(item.profitLossPercent || item.totalReturnPercent || 0) > 20
  );

  const stalePriceHoldings = performance.filter((item) => {
    const updatedAt = item.priceUpdatedAt || item.lastUpdated || item.last_updated;
    if (!updatedAt) return true;

    const lastUpdated = new Date(updatedAt);
    const today = new Date();
    const diffDays = (today - lastUpdated) / (1000 * 60 * 60 * 24);

    return diffDays > 7;
  });

  const fallbackPriceHoldings = performance.filter((item) => {
    const source = String(item.priceSource || item.source || "").toLowerCase();
    return source.includes("fallback") || source.includes("manual");
  });

  const highConcentrationHoldings = performance.filter((item) => {
    const currentValue = Number(item.currentValue || 0);
    const allocation =
      safePortfolioValue > 0 ? (currentValue / safePortfolioValue) * 100 : 0;

    return allocation > 40;
  });

  if (highConcentrationHoldings.length > 0) {
    alerts.push({
      type: "danger",
      severity: "High",
      title: `${highConcentrationHoldings.length} holding(s) exceed 40% allocation`,
      message: "Portfolio concentration risk detected.",
      affected: highConcentrationHoldings.map(getSymbol).join(", "),
      action: "Review Portfolio Strategy and consider reducing future contributions to overweight holdings.",
    });
  }

  if (losingHoldings.length > 0) {
    alerts.push({
      type: "danger",
      severity: "High",
      title: `${losingHoldings.length} holding(s) dropped more than 10%`,
      message: "Large unrealised loss detected.",
      affected: losingHoldings.map(getSymbol).join(", "),
      action: "Review whether the loss is due to market movement, fund weakness, or poor allocation.",
    });
  }

  if (incomeProgress < 50 && safeMonthlyGoal > 0) {
    alerts.push({
      type: "warning",
      severity: "Medium",
      title: "Passive income goal progress is below 50%",
      message: `Current progress: ${incomeProgress.toFixed(1)}% of monthly income goal.`,
      affected: "Income & Dividends",
      action: "Review dividend strategy or increase recurring contribution amount.",
    });
  }

  if (portfolioProgress < 50 && safePortfolioGoal > 0) {
    alerts.push({
      type: "warning",
      severity: "Medium",
      title: "Portfolio goal progress is below 50%",
      message: `Current progress: ${portfolioProgress.toFixed(1)}% of portfolio goal.`,
      affected: "Planning",
      action: "Review contribution plan and target timeline.",
    });
  }

  if (fallbackPriceHoldings.length > 0) {
    alerts.push({
      type: "warning",
      severity: "Low",
      title: `${fallbackPriceHoldings.length} holding(s) using manual fallback price`,
      message: "Some funds may not have reliable live market data.",
      affected: fallbackPriceHoldings.map(getSymbol).join(", "),
      action: "Keep fallback price updated manually if provider data is unavailable.",
    });
  }

  if (stalePriceHoldings.length > 0) {
    alerts.push({
      type: "warning",
      severity: "Low",
      title: `${stalePriceHoldings.length} holding(s) have stale market data`,
      message: "Market price was not updated recently.",
      affected: stalePriceHoldings.map(getSymbol).join(", "),
      action: "Click Refresh Market Prices.",
    });
  }

  if (highGainHoldings.length > 0) {
    alerts.push({
      type: "success",
      severity: "Positive",
      title: `${highGainHoldings.length} holding(s) gained more than 20%`,
      message: "Strong performance detected.",
      affected: highGainHoldings.map(getSymbol).join(", "),
      action: "Check whether the position has become overweight.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      severity: "Good",
      title: "No major portfolio alerts",
      message: "Your portfolio does not show any major warning signals now.",
      affected: "None",
      action: "Continue monitoring your portfolio regularly.",
    });
  }

  const dangerCount = alerts.filter((a) => a.type === "danger").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const goodCount = alerts.filter((a) => a.type === "success").length;

  const getAlertStyle = (type) => {
    if (type === "danger") {
      return "border-red-800 bg-red-950/40 text-red-300";
    }

    if (type === "warning") {
      return "border-yellow-800 bg-yellow-950/40 text-yellow-300";
    }

    return "border-emerald-800 bg-emerald-950/40 text-emerald-300";
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Portfolio Alerts</h2>
        <p className="mt-1 text-sm text-slate-400">
          Action-based checks for concentration risk, goal progress, performance and market data quality.
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-red-900 bg-red-950/20 p-4">
          <p className="text-sm text-slate-400">High Risk</p>
          <p className="text-2xl font-bold text-red-300">{dangerCount}</p>
        </div>

        <div className="rounded-xl border border-yellow-900 bg-yellow-950/20 p-4">
          <p className="text-sm text-slate-400">Watch</p>
          <p className="text-2xl font-bold text-yellow-300">{warningCount}</p>
        </div>

        <div className="rounded-xl border border-emerald-900 bg-emerald-950/20 p-4">
          <p className="text-sm text-slate-400">Positive / Healthy</p>
          <p className="text-2xl font-bold text-emerald-300">{goodCount}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-xl border p-4 ${getAlertStyle(alert.type)}`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold">{alert.title}</h3>

              <span className="rounded-full border border-current px-3 py-1 text-xs font-semibold">
                {alert.severity}
              </span>
            </div>

            <p className="text-sm opacity-90">{alert.message}</p>

            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <div>
                <p className="text-slate-400">Affected Area</p>
                <p className="font-semibold">{alert.affected}</p>
              </div>

              <div>
                <p className="text-slate-400">Suggested Action</p>
                <p className="font-semibold">{alert.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PortfolioAlert;
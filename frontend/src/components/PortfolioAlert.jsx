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

  const losingHoldings = performance.filter(
    (item) => Number(item.profitLossPercent || item.totalReturnPercent || 0) < -10
  );

  const highGainHoldings = performance.filter(
    (item) => Number(item.profitLossPercent || item.totalReturnPercent || 0) > 20
  );

  const stalePriceHoldings = performance.filter((item) => {
    if (!item.priceUpdatedAt) return true;

    const lastUpdated = new Date(item.priceUpdatedAt);
    const today = new Date();
    const diffDays = (today - lastUpdated) / (1000 * 60 * 60 * 24);

    return diffDays > 7;
  });

  const highConcentrationHoldings = performance.filter((item) => {
    const currentValue = Number(item.currentValue || 0);
    const allocation =
      safePortfolioValue > 0 ? (currentValue / safePortfolioValue) * 100 : 0;

    return allocation > 40;
  });

  if (portfolioProgress < 50 && safePortfolioGoal > 0) {
    alerts.push({
      type: "warning",
      title: "Portfolio goal progress is below 50%",
      message: "Consider increasing contribution or reviewing your goal timeline.",
    });
  }

  if (incomeProgress < 50 && safeMonthlyGoal > 0) {
    alerts.push({
      type: "warning",
      title: "Passive income goal progress is below 50%",
      message: "Dividend income is still far from your monthly target.",
    });
  }

  if (highConcentrationHoldings.length > 0) {
    alerts.push({
      type: "danger",
      title: `${highConcentrationHoldings.length} holding(s) exceed 40% allocation`,
      message: "Review concentration risk and consider whether rebalancing is needed.",
    });
  }

  if (losingHoldings.length > 0) {
    alerts.push({
      type: "danger",
      title: `${losingHoldings.length} holding(s) dropped more than 10%`,
      message: "Check whether the loss is due to market movement or holding weakness.",
    });
  }

  if (highGainHoldings.length > 0) {
    alerts.push({
      type: "success",
      title: `${highGainHoldings.length} holding(s) gained more than 20%`,
      message: "Strong performance detected. Check if any position is becoming overweight.",
    });
  }

  if (stalePriceHoldings.length > 0) {
    alerts.push({
      type: "warning",
      title: `${stalePriceHoldings.length} holding(s) have stale market data`,
      message: "Refresh market prices to keep portfolio valuation accurate.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      title: "No major portfolio alerts",
      message: "Your portfolio does not show any major warning signals now.",
    });
  }

  const getAlertStyle = (type) => {
    if (type === "danger") {
      return "border-red-800 bg-red-950/40 text-red-300";
    }

    if (type === "warning") {
      return "border-yellow-800 bg-yellow-950/40 text-yellow-300";
    }

    return "border-emerald-800 bg-emerald-950/40 text-emerald-300";
  };

  const getAlertLabel = (type) => {
    if (type === "danger") return "Risk";
    if (type === "warning") return "Watch";
    return "Good";
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Portfolio Alerts</h2>
        <p className="mt-1 text-sm text-slate-400">
          Automated checks for risk, goal progress and market data quality.
        </p>
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
                {getAlertLabel(alert.type)}
              </span>
            </div>

            <p className="text-sm opacity-90">{alert.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PortfolioAlert;
import { useEffect, useState } from "react";
import { getTargetAllocations } from "../api/portfolioApi";

function PortfolioActionCenter({
  performance,
  totalValue,
  monthlyPassiveIncome,
  monthlyIncomeGoal = 100,
  dividendCalendar = [],
}) {
  const [targets, setTargets] = useState({});

  useEffect(() => {
    const loadTargets = async () => {
      try {
        const res = await getTargetAllocations();
        setTargets(res.data || {});
      } catch (error) {
        console.error("Failed to load target allocations", error);
      }
    };

    loadTargets();
  }, []);

  const incomeGap = Math.max(0, monthlyIncomeGoal - monthlyPassiveIncome);

  const nextDividend = [...dividendCalendar]
    .filter((item) => new Date(item.expectedDate) >= new Date())
    .sort((a, b) => new Date(a.expectedDate) - new Date(b.expectedDate))[0];

  const rebalanceThresholdPercent = 1;
  const threshold = totalValue * (rebalanceThresholdPercent / 100);

  const rebalancingActions = performance
    .map((item) => {
      const currentPercent =
        totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0;

      const targetPercent = Number(targets[item.symbol] || 0);
      const targetValue = (targetPercent / 100) * totalValue;
      const difference = targetValue - item.currentValue;

      let action = "Hold";

      if (difference > threshold) {
        action = "Buy";
      } else if (difference < -threshold) {
        action = "Reduce";
      }

      return {
        symbol: item.symbol,
        name: item.name || item.type,
        currentPercent,
        targetPercent,
        difference,
        action,
      };
    })
    .filter((item) => item.action !== "Hold")
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  const actions = [];

  rebalancingActions.slice(0, 2).forEach((item) => {
    actions.push({
      title:
        item.action === "Buy"
          ? `Buy ${item.symbol}`
          : `Reduce ${item.symbol}`,
      description: `${item.symbol} is currently ${item.currentPercent.toFixed(
        2
      )}% vs target ${item.targetPercent.toFixed(2)}%. Suggested ${
        item.action === "Buy" ? "buy" : "reduction"
      }: $${Math.abs(item.difference).toFixed(2)}.`,
      status: item.action,
      color: item.action === "Buy" ? "green" : "yellow",
    });
  });

  if (incomeGap > 0) {
    actions.push({
      title: "Increase passive income",
      description: `You need another $${incomeGap.toFixed(
        2
      )}/month to reach your $${monthlyIncomeGoal.toFixed(
        2
      )} monthly income goal.`,
      status: "Income Gap",
      color: "blue",
    });
  }

  if (nextDividend) {
    actions.push({
      title: "Upcoming dividend",
      description: `${nextDividend.symbol} expected $${Number(
        nextDividend.expectedAmount
      ).toFixed(2)} on ${nextDividend.expectedDate}.`,
      status: "Upcoming",
      color: "green",
    });
  }

  actions.push({
    title: "Portfolio status",
    description:
      rebalancingActions.length === 0
        ? "Portfolio is close to target allocation."
        : `${rebalancingActions.length} asset(s) need rebalancing action.`,
    status: rebalancingActions.length === 0 ? "Good" : "Review",
    color: rebalancingActions.length === 0 ? "green" : "yellow",
  });

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Portfolio Action Center</h2>
        <p className="mt-1 text-sm text-slate-400">
          Priority actions based on rebalancing, income goal and upcoming dividends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action, index) => (
          <ActionCard
            key={`${action.title}-${index}`}
            number={index + 1}
            title={action.title}
            description={action.description}
            status={action.status}
            color={action.color}
          />
        ))}
      </div>
    </section>
  );
}

function ActionCard({ number, title, description, status, color }) {
  const badgeClass =
    color === "green"
      ? "bg-emerald-900 text-emerald-300"
      : color === "blue"
      ? "bg-blue-900 text-blue-300"
      : "bg-yellow-900 text-yellow-300";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-bold">
            {number}
          </div>

          <h3 className="font-bold">{title}</h3>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
          {status}
        </span>
      </div>

      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

export default PortfolioActionCenter;
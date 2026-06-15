import { useEffect, useState } from "react";
import {
  getTargetAllocations,
  saveTargetAllocations,
} from "../api/portfolioApi";

function RebalancingPlanner({ performance, totalValue }) {
  const [targets, setTargets] = useState({});
  const [status, setStatus] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState(1000);

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

  const handleTargetChange = (symbol, value) => {
    setTargets({
      ...targets,
      [symbol]: Number(value),
    });
  };

  const handleSaveTargets = async () => {
    try {
      await saveTargetAllocations(targets);
      setStatus("Saved");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error("Failed to save target allocations", error);
      setStatus("Save failed");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const totalTarget = Object.values(targets).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const useEqualWeightTarget = totalTarget === 0;

  const equalWeightTarget =
    performance && performance.length > 0
      ? 100 / performance.length
      : 0;

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getRecommendation = (item) => {
    const currentPercent =
      totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0;

    const targetPercent = useEqualWeightTarget
      ? equalWeightTarget
      : Number(targets[item.symbol] || 0);
    const targetValue = (targetPercent / 100) * totalValue;
    const difference = targetValue - item.currentValue;

    const rebalanceThresholdPercent = 1;
    const threshold = totalValue * (rebalanceThresholdPercent / 100);

    let action = "Hold";

    if (difference > threshold) {
      action = "Buy";
    } else if (difference < -threshold) {
      action = "Reduce";
    }

    return {
      currentPercent,
      targetPercent,
      targetValue,
      difference,
      action,
    };
  };

  const recommendations = (performance || []).map((item) => ({
    ...item,
    recommendation: getRecommendation(item),
  }));

  const assetsNeedingAction = recommendations.filter(
    (item) => item.recommendation.action !== "Hold"
  );

  const largestBuy = recommendations
    .filter((item) => item.recommendation.action === "Buy")
    .sort(
      (a, b) =>
        b.recommendation.difference - a.recommendation.difference
    )[0];

  const largestReduction = recommendations
    .filter((item) => item.recommendation.action === "Reduce")
    .sort(
      (a, b) =>
        a.recommendation.difference - b.recommendation.difference
    )[0];

  const buyRecommendations = recommendations
    .filter((item) => item.recommendation.action === "Buy")
    .sort(
      (a, b) =>
        b.recommendation.difference - a.recommendation.difference
    );

  const totalBuyGap = buyRecommendations.reduce(
    (sum, item) => sum + item.recommendation.difference,
    0
  );

  const contributionPlan = buyRecommendations.map((item) => {
    const amount =
      totalBuyGap > 0
        ? (item.recommendation.difference / totalBuyGap) *
          monthlyContribution
        : 0;

    const allocationPercent =
      monthlyContribution > 0
        ? (amount / monthlyContribution) * 100
        : 0;

    const newPortfolioValue = totalValue + monthlyContribution;
    const newAssetValue = item.currentValue + amount;

    const estimatedNewAllocation =
      newPortfolioValue > 0
        ? (newAssetValue / newPortfolioValue) * 100
        : 0;

    return {
      symbol: item.symbol,
      name: item.name,
      amount,
      allocationPercent,
      currentPercent: item.recommendation.currentPercent,
      estimatedNewAllocation,
    };
  });

  const totalAllocated = contributionPlan.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const remainingCash = monthlyContribution - totalAllocated;

  const portfolioStatus =
    assetsNeedingAction.length === 0
      ? "Well Balanced"
      : assetsNeedingAction.length <= 1
      ? "Minor Drift"
      : assetsNeedingAction.length <= 3
      ? "Moderate Drift"
      : "Significant Drift";

  const rebalanceScore =
    Math.max(
      0,
      100 -
        assetsNeedingAction.length * 10
    ); 

  const portfolioStatusColor =
    portfolioStatus === "Well Balanced"
      ? "text-emerald-400"
      : portfolioStatus === "Minor Drift"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Portfolio Rebalancing Planner
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Compare your current portfolio allocation against your target allocation.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Target Allocation Total
            </p>

            <p
              className={`mt-1 text-2xl font-bold ${
                totalTarget === 100
                  ? "text-emerald-400"
                  : "text-yellow-400"
              }`}
            >
              {totalTarget.toFixed(2)}%
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-sm text-slate-400">
              {useEqualWeightTarget
                ? "No saved target found. Using equal-weight allocation."
                : "Target allocation should total 100%."}
            </p>

            <button
              onClick={handleSaveTargets}
              disabled={totalTarget > 0 && totalTarget !== 100}
              className={`rounded-lg px-5 py-2 font-semibold ${
                totalTarget === 100
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-slate-700 cursor-not-allowed"
              }`}
            >
              {status || "Save Targets"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-6">
        <SummaryCard
          title="Portfolio Value"
          value={money(totalValue)}
          positive
        />

        <SummaryCard
          title="Portfolio Status"
          value={portfolioStatus}
          customClass={portfolioStatusColor}
        />

        <SummaryCard
          title="Rebalance Score"
          value={`${rebalanceScore}/100`}
          customClass={
            rebalanceScore >= 80
              ? "text-emerald-400"
              : rebalanceScore >= 60
              ? "text-yellow-400"
              : "text-red-400"
            }
        />

        <SummaryCard
          title="Assets Needing Action"
          value={assetsNeedingAction.length}
        />

        <SummaryCard
          title="Largest Buy"
          value={
            largestBuy
              ? `${largestBuy.symbol} ${money(largestBuy.recommendation.difference)}`
              : "None"
          }
          positive={Boolean(largestBuy)}
        />

        <SummaryCard
          title="Largest Reduction"
          value={
            largestReduction
              ? `${largestReduction.symbol} ${money(
              Math.abs(largestReduction.recommendation.difference)
              )}`
              : "None"
          }
          negative={Boolean(largestReduction)}
        />
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold">Contribution Rebalancer</h3>
            <p className="mt-1 text-sm text-slate-400">
              Plan where your next monthly investment should go.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Monthly Contribution
            </label>

            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) =>
                setMonthlyContribution(Number(e.target.value))
              }
              className="w-40 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
            />

            <div className="mt-2 flex flex-wrap gap-2">
              {[500, 1000, 2000, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setMonthlyContribution(amount)}
                  className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MiniCard
            title="Contribution"
            value={money(monthlyContribution)}
          />

          <MiniCard
            title="Allocated"
            value={money(totalAllocated)}
            positive
          />

          <MiniCard
            title="Remaining Cash"
            value={money(Math.max(remainingCash, 0))}
          />
        </div>

        {contributionPlan.length === 0 ? (
          <p className="text-sm text-slate-400">
            No contribution rebalancing needed. Your portfolio is close to target allocation.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {contributionPlan.map((item) => (
              <div
                key={item.symbol}
                className="rounded-lg border border-slate-800 bg-slate-900 p-4"
              >
                <p className="font-semibold">{item.symbol}</p>

                <p className="mt-1 max-w-[260px] truncate text-xs text-slate-400">
                  {item.name}
                </p>

                <p className="mt-3 text-xl font-bold text-emerald-400">
                  {money(item.amount)}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {item.allocationPercent.toFixed(2)}% of contribution
                </p>

                <div className="mt-3 rounded-lg bg-slate-950 p-3 text-sm">
                  <p className="text-slate-400">Estimated Allocation</p>
                  <p className="mt-1">
                    {item.currentPercent.toFixed(2)}% →{" "}
                    <span className="font-semibold text-emerald-400">
                      {item.estimatedNewAllocation.toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="p-3">Asset</th>
              <th className="p-3">Current %</th>
              <th className="p-3">Target %</th>
              <th className="p-3">Current Value</th>
              <th className="p-3">Target Value</th>
              <th className="p-3">Difference</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {recommendations.map((item) => {
              const result = item.recommendation;

              return (
                <tr
                  key={item.symbol}
                  className="border-b border-slate-800"
                >
                  <td className="p-3">
                    <div className="font-semibold">
                      {item.symbol}
                    </div>

                    <div className="mt-1 max-w-[260px] truncate text-xs text-slate-400">
                      {item.name || item.type}
                    </div>
                  </td>

                  <td className="p-3">
                    {result.currentPercent.toFixed(2)}%
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={targets[item.symbol] ?? ""}
                      onChange={(e) =>
                        handleTargetChange(
                          item.symbol,
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                    />
                  </td>

                  <td className="p-3">
                    {money(item.currentValue)}
                  </td>

                  <td className="p-3">
                    {money(result.targetValue)}
                  </td>

                  <td
                    className={`p-3 font-semibold ${
                      result.difference >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.difference >= 0
                      ? money(result.difference)
                      : `-${money(Math.abs(result.difference))}`}
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        result.action === "Buy"
                          ? "bg-emerald-900 text-emerald-300"
                          : result.action === "Reduce"
                          ? "bg-red-900 text-red-300"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {result.action}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!useEqualWeightTarget && totalTarget !== 100 && (
        <p className="mt-4 text-sm text-yellow-400">
          Your target allocation is {totalTarget.toFixed(2)}%. Adjust targets until it equals 100%.
        </p>
      )}
    </section>
  );
}

function SummaryCard({ title, value, positive, negative, customClass }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${
          customClass
            ? customClass
            : negative
            ? "text-red-400"
            : positive
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniCard({ title, value, positive }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs text-slate-400">{title}</p>

      <p
        className={`mt-1 text-lg font-bold ${
          positive ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default RebalancingPlanner;
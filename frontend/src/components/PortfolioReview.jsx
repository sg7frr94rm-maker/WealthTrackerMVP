import { useEffect, useMemo, useState } from "react";
import { getTargetAllocations } from "../api/portfolioApi";

function PortfolioReview({ performance = [], totalValue = 0 }) {
  const [targets, setTargets] = useState({});
  const [loadingTargets, setLoadingTargets] = useState(true);

  const DRIFT_THRESHOLD = 1;

  useEffect(() => {
    const loadTargets = async () => {
      try {
        setLoadingTargets(true);
        const res = await getTargetAllocations();
        setTargets(res.data || {});
      } catch (error) {
        console.error("Failed to load target allocations", error);
      } finally {
        setLoadingTargets(false);
      }
    };

    loadTargets();
  }, []);

  const percent = (value, decimals = 2) =>
    `${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}%`;

  const reviews = useMemo(() => {
    return performance.map((item) => {
      const currentAllocation =
        totalValue > 0
          ? (Number(item.currentValue || 0) / Number(totalValue || 0)) * 100
          : 0;

      const rawTarget = targets[item.symbol];

      const hasTarget =
        rawTarget !== undefined && rawTarget !== null && rawTarget !== "";

      if (!hasTarget) {
        return {
          ...item,
          currentAllocation,
          targetAllocation: null,
          difference: 0,
          status: "Setup Required",
          priority: "Medium",
          recommendation:
            "Configure target allocation under Goal Planning → Contribution Plan.",
        };
      }

      const targetAllocation = Number(rawTarget || 0);
      const difference = currentAllocation - targetAllocation;

      let status = "On Target";
      let priority = "Low";
      let recommendation = "Maintain current allocation.";

      if (difference > 3) {
        status = "Overweight";
        priority = "High";
        recommendation =
          "Reduce future contributions to this holding until it moves closer to target.";
      } else if (difference > DRIFT_THRESHOLD) {
        status = "Slightly Overweight";
        priority = "Medium";
        recommendation =
          "Reduce future contributions gradually or direct new funds elsewhere.";
      } else if (difference < -3) {
        status = "Underweight";
        priority = "High";
        recommendation =
          "Increase future contributions to this holding to move closer to target.";
      } else if (difference < -DRIFT_THRESHOLD) {
        status = "Slightly Underweight";
        priority = "Medium";
        recommendation =
          "Consider allocating more of your next contribution to this holding.";
      }

      return {
        ...item,
        currentAllocation,
        targetAllocation,
        difference,
        status,
        priority,
        recommendation,
      };
    });
  }, [performance, totalValue, targets]);

  const configuredTargets = reviews.filter(
    (item) => item.targetAllocation !== null
  );

  const missingTargets = reviews.filter(
    (item) => item.targetAllocation === null
  );

  const meaningfulDrifts = configuredTargets.filter(
    (item) => Math.abs(item.difference) > DRIFT_THRESHOLD
  );

  const alignmentScore =
    configuredTargets.length > 0
      ? Math.max(
          0,
          100 -
            configuredTargets.reduce((sum, item) => {
              return (
                sum +
                (Math.abs(item.difference) > DRIFT_THRESHOLD
                  ? Math.abs(item.difference)
                  : 0)
              );
            }, 0)
        )
      : 0;

  const mostOverweight = [...configuredTargets]
    .filter((item) => item.difference > DRIFT_THRESHOLD)
    .sort((a, b) => b.difference - a.difference)[0];

  const mostUnderweight = [...configuredTargets]
    .filter((item) => item.difference < -DRIFT_THRESHOLD)
    .sort((a, b) => a.difference - b.difference)[0];

  const nextContributionPriority = [...configuredTargets]
    .filter((item) => item.difference < -DRIFT_THRESHOLD)
    .sort((a, b) => a.difference - b.difference)[0];

  const priorityRanking = [...configuredTargets]
    .filter((item) => Math.abs(item.difference) > DRIFT_THRESHOLD)
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 3);

  const healthInsights = useMemo(() => {
    const insights = [];

    if (missingTargets.length > 0) {
      insights.push({
        type: "warning",
        text: `${missingTargets.length} holding(s) still need target allocation setup.`,
      });
    } else {
      insights.push({
        type: "good",
        text: "Target allocation is configured for all current holdings.",
      });
    }

    if (mostOverweight) {
      insights.push({
        type: "warning",
        text: `${mostOverweight.symbol} is overweight by ${percent(
          Math.abs(mostOverweight.difference)
        )}.`,
      });
    }

    if (mostUnderweight) {
      insights.push({
        type: "warning",
        text: `${mostUnderweight.symbol} is underweight by ${percent(
          Math.abs(mostUnderweight.difference)
        )}.`,
      });
    }

    if (alignmentScore >= 80 && configuredTargets.length > 0) {
      insights.push({
        type: "good",
        text: "Portfolio alignment is healthy against your target allocation.",
      });
    } else if (configuredTargets.length > 0) {
      insights.push({
        type: "warning",
        text: "Portfolio alignment needs review before your next contribution.",
      });
    }

    const concentratedHolding = reviews.find(
      (item) => item.currentAllocation > 40
    );

    if (concentratedHolding) {
      insights.push({
        type: "warning",
        text: `${concentratedHolding.symbol} exceeds 40% allocation. Monitor concentration risk.`,
      });
    } else if (reviews.length > 0) {
      insights.push({
        type: "good",
        text: "No holding exceeds the 40% concentration threshold.",
      });
    }

    return insights;
  }, [
    missingTargets,
    mostOverweight,
    mostUnderweight,
    alignmentScore,
    configuredTargets,
    reviews,
  ]);

  const alignmentColor =
    alignmentScore >= 80
      ? "text-emerald-400"
      : alignmentScore >= 60
      ? "text-yellow-400"
      : "text-red-400";

  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red-400";
    if (priority === "Medium") return "text-yellow-400";
    return "text-emerald-400";
  };

  const getStatusBadge = (status) => {
    if (status === "Overweight") return "bg-red-900 text-red-300";
    if (status === "Underweight") return "bg-yellow-900 text-yellow-300";

    if (status === "Slightly Overweight" || status === "Slightly Underweight") {
      return "bg-yellow-900 text-yellow-300";
    }

    if (status === "Setup Required") return "bg-blue-900 text-blue-300";

    return "bg-emerald-900 text-emerald-300";
  };

  if (loadingTargets) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <p className="text-sm text-slate-400">
          Loading portfolio review data...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {missingTargets.length > 0 && (
        <div className="rounded-xl border border-yellow-800 bg-yellow-950/30 p-5">
          <h3 className="font-bold text-yellow-300">
            Target allocation setup required
          </h3>

          <p className="mt-2 text-sm text-yellow-100">
            Please configure your target allocations under{" "}
            <span className="font-semibold">
              Goal Planning → Contribution Plan
            </span>
            .
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Alignment Score"
          value={
            configuredTargets.length > 0
              ? `${alignmentScore.toFixed(0)}/100`
              : "N/A"
          }
          color={configuredTargets.length > 0 ? alignmentColor : "text-slate-400"}
        />

        <SummaryCard
          title="Most Overweight"
          value={mostOverweight ? mostOverweight.symbol : "None"}
          color={mostOverweight ? "text-red-400" : "text-white"}
        />

        <SummaryCard
          title="Most Underweight"
          value={mostUnderweight ? mostUnderweight.symbol : "None"}
          color={mostUnderweight ? "text-yellow-400" : "text-white"}
        />

        <SummaryCard
          title="Next Contribution Priority"
          value={
            nextContributionPriority ? nextContributionPriority.symbol : "None"
          }
          color={nextContributionPriority ? "text-emerald-400" : "text-white"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-bold">Portfolio Action Summary</h3>

          <div className="mt-3 space-y-2 text-sm">
            {mostOverweight && (
              <p className="text-red-300">
                Reduce future contributions to{" "}
                <span className="font-semibold">{mostOverweight.symbol}</span>{" "}
                because it is above target by{" "}
                <span className="font-semibold">
                  {percent(Math.abs(mostOverweight.difference))}
                </span>
                .
              </p>
            )}

            {mostUnderweight && (
              <p className="text-yellow-300">
                Increase future contributions to{" "}
                <span className="font-semibold">{mostUnderweight.symbol}</span>{" "}
                because it is below target by{" "}
                <span className="font-semibold">
                  {percent(Math.abs(mostUnderweight.difference))}
                </span>
                .
              </p>
            )}

            {meaningfulDrifts.length === 0 && configuredTargets.length > 0 && (
              <p className="text-emerald-300">
                Portfolio allocation is aligned with your target allocation. No
                rebalancing actions are currently required.
              </p>
            )}

            {configuredTargets.length === 0 && (
              <p className="text-slate-400">
                Target allocations have not been configured. Go to Goal Planning
                → Contribution Plan and save your desired target allocation
                percentages.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-bold">Rebalancing Priority</h3>

          {priorityRanking.length === 0 ? (
            <p className="mt-3 text-sm text-emerald-300">
              No meaningful allocation drift above {percent(DRIFT_THRESHOLD, 0)}.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {priorityRanking.map((item, index) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between rounded-lg bg-slate-900 p-3"
                >
                  <div>
                    <p className="font-semibold">
                      #{index + 1} {item.symbol}
                    </p>

                    <p className="text-xs text-slate-400">{item.status}</p>
                  </div>

                  <span
                    className={`font-bold ${
                      item.difference > DRIFT_THRESHOLD
                        ? "text-red-400"
                        : item.difference < -DRIFT_THRESHOLD
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {item.difference > 0 ? "+" : ""}
                    {percent(item.difference)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="font-bold">Portfolio Health Insights</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {healthInsights.map((insight, index) => (
            <div
              key={`${insight.text}-${index}`}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              <p
                className={`font-medium ${
                  insight.type === "good"
                    ? "text-emerald-300"
                    : "text-yellow-300"
                }`}
              >
                {insight.type === "good" ? "✓" : "⚠"} {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((item) => (
          <div
            key={item.symbol}
            className="rounded-xl border border-slate-800 bg-slate-950 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{item.symbol}</h3>

                <p className="mt-1 max-w-[280px] truncate text-xs text-slate-400">
                  {item.name || item.type || "Portfolio holding"}
                </p>
              </div>

              <span className={`font-semibold ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <InfoBox
                label="Current Allocation"
                value={percent(item.currentAllocation)}
              />

              <InfoBox
                label="Target Allocation"
                value={
                  item.targetAllocation === null
                    ? "Not Configured"
                    : percent(item.targetAllocation)
                }
              />

              <InfoBox
                label="Drift"
                value={
                  item.targetAllocation === null
                    ? "N/A"
                    : `${item.difference > 0 ? "+" : ""}${percent(
                        item.difference
                      )}`
                }
                valueClass={
                  item.targetAllocation === null
                    ? "text-slate-300"
                    : item.difference > DRIFT_THRESHOLD
                    ? "text-red-400"
                    : item.difference < -DRIFT_THRESHOLD
                    ? "text-yellow-400"
                    : "text-emerald-400"
                }
              />

              <InfoBox
                label="Required Action"
                value={item.recommendation}
              />

              <div>
                <p className="mb-1 text-xs text-slate-400">Status</p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ title, value, color = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function InfoBox({ label, value, valueClass = "text-white" }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default PortfolioReview;
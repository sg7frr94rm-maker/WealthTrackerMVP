import { useState } from "react";

function PortfolioStressTest({
  portfolioValue = 0,
  netWorth = 0,
  portfolioGoal = 0,
}) {
  const [customDrop, setCustomDrop] = useState(25);

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const percent = (value) =>
    `${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;

  const scenarios = [-10, -20, -30, -40, -50, -customDrop];

  const currentGoalProgress =
    portfolioGoal > 0 ? (portfolioValue / portfolioGoal) * 100 : 0;

  const stressResults = scenarios.map((drop) => {
    const dropPercent = Math.abs(Number(drop || 0));

    const stressedPortfolioValue =
      Number(portfolioValue || 0) * (1 - dropPercent / 100);

    const portfolioLoss =
      Number(portfolioValue || 0) - stressedPortfolioValue;

    const stressedNetWorth =
      Number(netWorth || 0) - portfolioLoss;

    const goalProgress =
      portfolioGoal > 0
        ? (stressedPortfolioValue / Number(portfolioGoal || 0)) * 100
        : 0;

    const recoveryNeeded =
      stressedPortfolioValue > 0
        ? ((Number(portfolioValue || 0) - stressedPortfolioValue) /
            stressedPortfolioValue) *
          100
        : 0;

    return {
      dropPercent,
      stressedPortfolioValue,
      portfolioLoss,
      stressedNetWorth,
      goalProgress,
      recoveryNeeded,
    };
  });

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Portfolio Stress Test Simulator
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Simulate how market drawdowns may affect your portfolio value, net
          worth and goal progress.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StressCard
          title="Current Portfolio"
          value={money(portfolioValue)}
          positive
        />

        <StressCard
          title="Current Net Worth"
          value={money(netWorth)}
          positive
        />

        <StressCard
          title="Goal Progress"
          value={percent(currentGoalProgress)}
          positive
        />
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold">Custom Stress Scenario</h3>

            <p className="mt-1 text-sm text-slate-400">
              Add your own market drop percentage.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Market Drop %
            </label>

            <input
              type="number"
              value={customDrop}
              onChange={(e) =>
                setCustomDrop(Math.max(0, Number(e.target.value)))
              }
              className="h-12 w-40 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stressResults.map((item) => (
          <div
            key={item.dropPercent}
            className="rounded-xl border border-slate-800 bg-slate-950 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Market -{item.dropPercent}%
              </h3>

              <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-semibold text-red-300">
                Stress
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <MiniMetric
                label="Portfolio Value"
                value={money(item.stressedPortfolioValue)}
              />

              <MiniMetric
                label="Portfolio Loss"
                value={`-${money(item.portfolioLoss)}`}
                negative
              />

              <MiniMetric
                label="Net Worth"
                value={money(item.stressedNetWorth)}
              />

              <MiniMetric
                label="Recovery Needed"
                value={percent(item.recoveryNeeded)}
              />

              <MiniMetric
                label="Goal Progress"
                value={percent(item.goalProgress)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StressCard({ title, value, positive }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          positive ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniMetric({ label, value, negative }) {
  return (
    <div className="rounded-lg bg-slate-900 p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p
        className={`mt-1 font-bold ${
          negative ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default PortfolioStressTest;
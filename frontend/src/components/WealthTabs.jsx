import MetricCard from "./MetricCard";
import NetWorthTracker from "./NetWorthTracker";

function WealthTabs({
  totalValue,
  portfolioGoal,
  netWorth,
  cash,
  cpf,
  otherAssets,
  loans,
}) {
  const totalAssets =
    Number(totalValue || 0) +
    Number(cash || 0) +
    Number(cpf || 0) +
    Number(otherAssets || 0);

  const totalLiabilities = Number(loans || 0);

  const portfolioGoalProgress =
    portfolioGoal > 0 ? (totalValue / portfolioGoal) * 100 : 0;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Wealth Measurement</h2>
        <p className="mt-1 text-sm text-slate-400">
          Measure your net worth, assets, liabilities and portfolio goal progress.
        </p>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          value={`$${Number(netWorth || 0).toFixed(2)}`}
          positive={netWorth >= 0}
        />

        <MetricCard
          title="Total Assets"
          value={`$${totalAssets.toFixed(2)}`}
          positive
        />

        <MetricCard
          title="Liabilities"
          value={`$${totalLiabilities.toFixed(2)}`}
          positive={totalLiabilities === 0}
        />

        <MetricCard
          title="Portfolio Goal"
          value={`${portfolioGoalProgress.toFixed(2)}%`}
          positive={portfolioGoalProgress >= 50}
        />
      </section>

      <NetWorthTracker investmentValue={totalValue} />
    </section>
  );
}

export default WealthTabs;
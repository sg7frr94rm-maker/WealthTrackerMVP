function MarketDataHealth({ performance = [] }) {
  const now = new Date();

  const totalHoldings = performance.length;

  const liveCount = performance.filter(
    (item) => item.priceStatus === "Live"
  ).length;

  const manualCount = performance.filter(
    (item) =>
      item.priceStatus === "Manual" || item.priceStatus === "Fallback"
  ).length;

  const staleItems = performance.filter((item) => {
    if (!item.priceUpdatedAt) return true;

    const updatedAt = new Date(item.priceUpdatedAt);
    const diffDays = (now - updatedAt) / (1000 * 60 * 60 * 24);

    return diffDays > 7;
  });

  const latestRefresh =
    performance.length > 0
      ? performance
          .map((item) => item.priceUpdatedAt)
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0]
      : null;

  const formatDateTime = (date) =>
    date
      ? new Date(date).toLocaleString("en-SG", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

   const healthScore = totalHoldings > 0
    ? Math.round(
        ((liveCount + manualCount * 0.7) / totalHoldings) * 100
      )
    : 0;

  const healthLabel =
    healthScore >= 80
      ? "Healthy"
      : healthScore >= 50
      ? "Needs Review"
      : "Weak";

  const healthColor =
    healthScore >= 80
      ? "text-emerald-400"
      : healthScore >= 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="mb-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-bold">Market Data Health</h3>

          <p className="mt-1 text-sm text-slate-400">
            Checks whether your holding prices are live, manual, fallback or
            stale.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className={`text-2xl font-bold ${healthColor}`}>
            {healthScore}/100
          </p>

          <p className="text-sm text-slate-400">{healthLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <HealthCard title="Live Prices" value={liveCount} positive />

        <HealthCard
          title="Manual / Fallback"
          value={manualCount}
          warning={manualCount > 0}
        />

        <HealthCard
          title="Stale Prices"
          value={staleItems.length}
          danger={staleItems.length > 0}
        />

        <HealthCard
          title="Last Refresh"
          value={formatDateTime(latestRefresh)}
          small
        />
      </div>

      {(manualCount > 0 || staleItems.length > 0) && (
        <div className="mt-5 rounded-lg border border-yellow-900 bg-yellow-950/30 p-4">
          <p className="font-semibold text-yellow-300">
            Market Data Attention Needed
          </p>

          <div className="mt-2 space-y-1 text-sm text-slate-300">
            {manualCount > 0 && (
              <p>
                {manualCount} holding
                {manualCount > 1 ? "s are" : " is"} using manual or fallback
                prices.
              </p>
            )}

            {staleItems.length > 0 && (
              <p>
                {staleItems.length} holding
                {staleItems.length > 1 ? "s have" : " has"} price data older
                than 7 days.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HealthCard({ title, value, positive, warning, danger, small }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 font-bold ${
          small ? "text-sm" : "text-2xl"
        } ${
          danger
            ? "text-red-400"
            : warning
            ? "text-yellow-400"
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

export default MarketDataHealth;
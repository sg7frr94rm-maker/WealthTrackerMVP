function PortfolioInsightsPanel({
  strengths,
  opportunities,
}) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-5 text-xl font-bold">
        Portfolio Strengths & Opportunities
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-800 bg-slate-950 p-5">
          <h3 className="mb-4 text-lg font-bold text-emerald-400">
            Strengths
          </h3>

          <ul className="space-y-3 text-slate-300">
            {strengths.map((item, index) => (
              <li key={index}>✓ {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-800 bg-slate-950 p-5">
          <h3 className="mb-4 text-lg font-bold text-amber-400">
            Opportunities
          </h3>

          <ul className="space-y-3 text-slate-300">
            {opportunities.map((item, index) => (
              <li key={index}>→ {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PortfolioInsightsPanel;
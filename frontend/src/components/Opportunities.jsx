import { useEffect, useState } from "react";
import { getOpportunities } from "../api/portfolioApi";

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [investmentAmount, setInvestmentAmount] = useState(10000);

  useEffect(() => {
    getOpportunities()
      .then((res) => {
        setOpportunities(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Investment Opportunities</h2>
        <p className="mt-1 text-slate-400">
          Portfolio-fit ideas based on diversification, income gap, risk and market news.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <label className="mb-2 block text-sm text-slate-400">
          Simulate investment amount
        </label>

        <input
          type="number"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />
      </div>

      {opportunities.map((item, index) => {
        const impact = calculateImpact(item, investmentAmount);

        return (
          <div
            key={item.ticker}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-400">
                  #{index + 1} Portfolio Fit
                </p>

                <h3 className="mt-1 text-2xl font-bold">{item.ticker}</h3>

                <p className="mt-2 text-slate-300">{item.reason}</p>
              </div>

              <span className="text-lg font-bold text-emerald-400">
                {item.score}/10
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>Role: {item.role}</span>
              <span>Risk: {item.risk}</span>
              <span>
                Market Impact:{" "}
                <span className={impactClass(item.marketImpact)}>
                  {item.marketImpact}
                </span>
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <InfoPanel title="Why this fits your portfolio">
                {getPortfolioReasons(item).map((reason) => (
                  <p key={reason}>✓ {reason}</p>
                ))}
              </InfoPanel>

              <InfoPanel title={`Impact if bought: $${investmentAmount.toLocaleString()}`}>
                <p>Estimated income gain: ${impact.estimatedIncome}/year</p>
                <p>Estimated monthly income: ${impact.monthlyIncome}/month</p>
                <p>Portfolio role added: {item.role}</p>
              </InfoPanel>

              <InfoPanel title={`Related News (${item.relatedNews?.length || 0})`}>
                {item.relatedNews?.length > 0 ? (
                  item.relatedNews.map((news, newsIndex) => (
                    <a
                      key={`${news.title}-${newsIndex}`}
                      href={news.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-slate-800 bg-slate-950 p-3 hover:border-emerald-600"
                    >
                      <p className="font-semibold text-slate-200">
                        {news.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {news.source} •{" "}
                        {news.date
                          ? new Date(news.date).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </a>
                  ))
                ) : (
                  <p>No related news found.</p>
                )}
              </InfoPanel>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
      <h4 className="mb-3 font-bold text-white">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function getPortfolioReasons(item) {
  const ticker = item.ticker;

  if (ticker === "SCHD") {
    return [
      "Supports your low dividend-income score",
      "Adds dividend-growth exposure",
      "Can help improve passive income over time",
    ];
  }

  if (ticker === "VNQ") {
    return [
      "Adds REIT exposure that your portfolio currently lacks",
      "Improves asset-class diversification",
      "Reduces dependency on mutual-fund-only holdings",
    ];
  }

  if (ticker === "VOO") {
    return [
      "Provides broad US market exposure",
      "Can act as a core long-term holding",
      "Reduces single-fund concentration risk",
    ];
  }

  if (ticker === "JEPI") {
    return [
      "Supports monthly income objective",
      "May improve cashflow consistency",
      "Useful if passive income is a priority",
    ];
  }

  if (ticker === "QQQ") {
    return [
      "Adds growth exposure",
      "Improves technology-sector participation",
      "Useful if long-term capital growth is a goal",
    ];
  }

  return ["May improve portfolio diversification."];
}

function calculateImpact(item, investmentAmount) {
  const assumedYield =
    item.ticker === "JEPI"
      ? 7
      : item.ticker === "SCHD"
      ? 3.5
      : item.ticker === "VNQ"
      ? 4
      : item.ticker === "VOO"
      ? 1.4
      : item.ticker === "QQQ"
      ? 0.7
      : 2;

  const estimatedIncome = (investmentAmount * assumedYield) / 100;
  const monthlyIncome = estimatedIncome / 12;

  return {
    estimatedIncome: estimatedIncome.toFixed(2),
    monthlyIncome: monthlyIncome.toFixed(2),
  };
}

function impactClass(impact) {
  if (impact === "Positive") return "font-semibold text-emerald-400";
  if (impact === "Negative") return "font-semibold text-red-400";
  return "font-semibold text-slate-300";
}
import { useEffect, useMemo, useState } from "react";
import { getMarketNews } from "../api/portfolioApi";
import Opportunities from "./Opportunities";

function MarketNews() {
  const [activeTab, setActiveTab] = useState("news");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      setLoading(true);
      const res = await getMarketNews();
      setNews(res.data || []);
    } catch (error) {
      console.error("Failed to load market news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const sentiment = useMemo(() => {
    return news.reduce(
      (acc, item) => {
        if (item.impact === "Positive") acc.positive += 1;
        else if (item.impact === "Negative") acc.negative += 1;
        else acc.neutral += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  }, [news]);

  const overallSentiment =
    sentiment.positive > sentiment.negative
      ? "Positive"
      : sentiment.negative > sentiment.positive
      ? "Negative"
      : "Neutral";

  const marketRiskLevel =
    sentiment.negative >= 3
      ? "High"
      : sentiment.negative >= 1
      ? "Medium"
      : "Low";

  const affectedHoldings = [
    ...new Set(
      news.flatMap((item) =>
        item.affects
          ? item.affects
              .split(",")
              .map((symbol) => symbol.trim())
              .filter(Boolean)
          : []
      )
    ),
  ];

  const affectedHoldingsCount = affectedHoldings.length;

  const latestNewsDate =
    news.length > 0
      ? new Date(
          Math.max(...news.map((item) => new Date(item.date || 0)))
        ).toLocaleDateString("en-SG")
      : "-";

  const getItemRiskLevel = (impact) => {
    if (impact === "Negative") return "High";
    if (impact === "Positive") return "Low";
    return "Medium";
  };

  const getActionSuggestion = (impact) => {
    if (impact === "Negative") return "Review affected holdings";
    if (impact === "Positive") return "Consider opportunity";
    return "Monitor";
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Market Intelligence</h2>

        <p className="mt-1 text-sm text-slate-400">
          Review market news impact and investment opportunities.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "news"}
          onClick={() => setActiveTab("news")}
        >
          Market News
        </TabButton>

        <TabButton
          active={activeTab === "opportunities"}
          onClick={() => setActiveTab("opportunities")}
        >
          Investment Opportunities
        </TabButton>
      </div>

      {activeTab === "news" && (
        <>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold">Market News Impact</h3>

              <p className="mt-1 text-sm text-slate-400">
                News that may affect your current ETFs, mutual funds, REITs and
                market sentiment.
              </p>
            </div>

            <button
              onClick={loadNews}
              className="rounded-lg bg-slate-800 px-4 py-2 font-semibold hover:bg-slate-700"
            >
              Refresh News
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <SentimentCard
              title="Overall Sentiment"
              value={overallSentiment}
              type={overallSentiment}
            />

            <SentimentCard
              title="Market Risk Level"
              value={marketRiskLevel}
              type={
                marketRiskLevel === "High"
                  ? "Negative"
                  : marketRiskLevel === "Medium"
                  ? "Neutral"
                  : "Positive"
              }
            />

            <SentimentCard
              title="Affected Holdings"
              value={affectedHoldingsCount}
              type="Neutral"
            />

            <SentimentCard
              title="Latest News Date"
              value={latestNewsDate}
              type="Neutral"
            />
          </div>

          {affectedHoldings.length > 0 && (
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Affected Holdings</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {affectedHoldings.map((symbol) => (
                  <span
                    key={symbol}
                    className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">Loading market news...</p>
          ) : news.length === 0 ? (
            <p className="text-sm text-slate-400">No news available.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {news.map((item, index) => {
                const itemRiskLevel = getItemRiskLevel(item.impact);
                const actionSuggestion = getActionSuggestion(item.impact);

                return (
                  <a
                    key={`${item.title}-${index}`}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-emerald-600 hover:bg-slate-900"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">
                          Related: {item.relatedTo || "Market"}
                        </p>

                        <p className="text-xs font-semibold text-slate-300">
                          Affects: {item.affects || "General Market"}
                        </p>

                        <p className="text-xs text-slate-400">
                          Market Risk:{" "}
                          <span
                            className={
                              itemRiskLevel === "High"
                                ? "font-semibold text-red-300"
                                : itemRiskLevel === "Medium"
                                ? "font-semibold text-yellow-300"
                                : "font-semibold text-emerald-300"
                            }
                          >
                            {itemRiskLevel}
                          </span>
                        </p>

                        <p className="text-xs text-slate-400">
                          Action:{" "}
                          <span className="font-semibold text-amber-300">
                            {actionSuggestion}
                          </span>
                        </p>
                      </div>

                      <ImpactBadge impact={item.impact} />
                    </div>

                    <h3 className="font-semibold text-white">{item.title}</h3>

                    <p className="mt-2 text-xs text-slate-500">
                      {item.source || "Unknown source"} •{" "}
                      {item.date
                        ? new Date(item.date).toLocaleDateString("en-SG")
                        : "Unknown date"}
                    </p>
                  </a>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === "opportunities" && <Opportunities />}
    </section>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 font-semibold transition-all duration-300 ${
        active
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-700/40"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SentimentCard({ title, value, type }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`mt-2 text-2xl font-bold ${
          type === "Positive"
            ? "text-emerald-400"
            : type === "Negative"
            ? "text-red-400"
            : "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ImpactBadge({ impact }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        impact === "Positive"
          ? "bg-emerald-900 text-emerald-300"
          : impact === "Negative"
          ? "bg-red-900 text-red-300"
          : "bg-slate-800 text-slate-300"
      }`}
    >
      {impact || "Neutral"}
    </span>
  );
}

export default MarketNews;
import { useEffect, useMemo, useState } from "react";
import { getMarketNews } from "../api/portfolioApi";

function MarketNews() {
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
      {
        positive: 0,
        neutral: 0,
        negative: 0,
      }
    );
  }, [news]);

  const overallSentiment =
    sentiment.positive > sentiment.negative
      ? "Positive"
      : sentiment.negative > sentiment.positive
      ? "Negative"
      : "Neutral";

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Market News Impact</h2>
          <p className="mt-1 text-sm text-slate-400">
            News that may affect your current ETFs, mutual funds, REITs and market sentiment.
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
          title="Positive"
          value={sentiment.positive}
          type="Positive"
        />

        <SentimentCard
          title="Neutral"
          value={sentiment.neutral}
          type="Neutral"
        />

        <SentimentCard
          title="Negative"
          value={sentiment.negative}
          type="Negative"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading market news...</p>
      ) : news.length === 0 ? (
        <p className="text-sm text-slate-400">No news available.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {news.map((item, index) => (
            <a
              key={`${item.title}-${index}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-emerald-600 hover:bg-slate-900"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Related: {item.relatedTo}
                  </p>

                  <p className="text-xs font-semibold text-slate-300">
                    Affects: {item.affects}
                  </p>
                </div>

                <ImpactBadge impact={item.impact} />
              </div>

              <h3 className="font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                {item.source} •{" "}
                {item.date
                  ? new Date(item.date).toLocaleDateString()
                  : "Unknown date"}
              </p>
            </a>
          ))}
        </div>
      )}
    </section>
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
      {impact}
    </span>
  );
}

export default MarketNews;
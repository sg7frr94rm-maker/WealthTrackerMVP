function AchievementTracker({
  portfolioValue,
  netWorth,
  totalDividends,
}) {
  const achievements = [
    // Portfolio
    {
      title: "First Investment",
      description: "Started investing journey",
      unlocked: portfolioValue > 0,
      icon: "🚀",
    },
    {
      title: "Portfolio $10K",
      description: "Portfolio reached $10,000",
      unlocked: portfolioValue >= 10000,
      icon: "💰",
    },
    {
      title: "Portfolio $50K",
      description: "Portfolio reached $50,000",
      unlocked: portfolioValue >= 50000,
      icon: "🏆",
    },
    {
      title: "Portfolio $100K",
      description: "Portfolio reached $100,000",
      unlocked: portfolioValue >= 100000,
      icon: "⭐",
    },

    // Dividends
    {
      title: "First Dividend",
      description: "Received first dividend",
      unlocked: totalDividends > 0,
      icon: "💵",
    },
    {
      title: "$100 Dividends",
      description: "Collected $100 dividends",
      unlocked: totalDividends >= 100,
      icon: "🎯",
    },
    {
      title: "$500 Dividends",
      description: "Collected $500 dividends",
      unlocked: totalDividends >= 500,
      icon: "💎",
    },

    // Net Worth
    {
      title: "$100K Net Worth",
      description: "Net worth exceeded $100K",
      unlocked: netWorth >= 100000,
      icon: "🏠",
    },
    {
      title: "$500K Net Worth",
      description: "Net worth exceeded $500K",
      unlocked: netWorth >= 500000,
      icon: "🥇",
    },
    {
      title: "Millionaire",
      description: "Net worth exceeded $1M",
      unlocked: netWorth >= 1000000,
      icon: "👑",
    },
  ];

  const unlockedCount = achievements.filter(
    (a) => a.unlocked
  ).length;

  const progress =
    (unlockedCount / achievements.length) * 100;

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Achievement Tracker
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Celebrate your investing milestones.
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-emerald-400">
            {unlockedCount}/{achievements.length}
          </p>

          <p className="text-sm text-slate-400">
            Unlocked
          </p>
        </div>
      </div>

      <div className="mb-6 h-3 w-full rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-emerald-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className={`rounded-xl border p-4 ${
              achievement.unlocked
                ? "border-emerald-700 bg-emerald-950/20"
                : "border-slate-800 bg-slate-950"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">
                {achievement.icon}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  achievement.unlocked
                    ? "bg-emerald-900 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {achievement.unlocked
                  ? "Unlocked"
                  : "Locked"}
              </span>
            </div>

            <h3 className="font-semibold">
              {achievement.title}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {achievement.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AchievementTracker;
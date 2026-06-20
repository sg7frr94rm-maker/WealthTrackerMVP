const express = require("express");
const router = express.Router();

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

const number = (value) =>
  Number(value || 0).toLocaleString("en-SG");

router.post("/portfolio/ai-insights", async (req, res) => {
  try {
    const {
      totalValue = 0,
      totalDividends = 0,
      monthlyPassiveIncome = 0,
      portfolioGoal = 100000,
      yieldOnCost = 0,
      performance = [],
    } = req.body;

    const safeTotalValue = Number(totalValue || 0);
    const safeTotalDividends = Number(totalDividends || 0);
    const safeMonthlyPassiveIncome = Number(monthlyPassiveIncome || 0);
    const safePortfolioGoal = Number(portfolioGoal || 0);
    const safeYieldOnCost = Number(yieldOnCost || 0);

    const goalProgress =
      safePortfolioGoal > 0
        ? (safeTotalValue / safePortfolioGoal) * 100
        : 0;

    const largestPosition =
      performance.length > 0
        ? [...performance].sort(
            (a, b) => Number(b.currentValue || 0) - Number(a.currentValue || 0)
          )[0]
        : null;

    const largestAllocation =
      largestPosition && safeTotalValue > 0
        ? (Number(largestPosition.currentValue || 0) / safeTotalValue) * 100
        : 0;

    const assetTypes = [
      ...new Set(
        performance.map((item) => item.assetType || item.type || "Unknown")
      ),
    ];

    const insights = [];

    insights.push({
      title: "Portfolio Overview",
      category: "Overview",
      priority: "Info",
      message: `Your portfolio is currently worth ${money(safeTotalValue)}.`,
    });

    insights.push({
      title: "Income Analysis",
      category: "Income",
      priority: safeYieldOnCost < 1 ? "High" : "Medium",
      message: `You have received ${money(
        safeTotalDividends
      )} in dividends, generating about ${money(
        safeMonthlyPassiveIncome
      )} per month.`,
    });

    if (safeYieldOnCost < 1) {
      insights.push({
        title: "Income Opportunity",
        category: "Opportunity",
        priority: "High",
        message: `Income generation is currently low at ${percent(
          safeYieldOnCost
        )} yield on cost. Consider reviewing dividend ETFs, REITs, or income-focused assets if passive income is one of your goals.`,
      });
    } else if (safeYieldOnCost < 3) {
      insights.push({
        title: "Income Improvement",
        category: "Opportunity",
        priority: "Medium",
        message: `Your yield on cost is ${percent(
          safeYieldOnCost
        )}. There may still be room to improve income generation depending on your investment objective.`,
      });
    } else {
      insights.push({
        title: "Income Strength",
        category: "Strength",
        priority: "Low",
        message: `Your yield on cost is ${percent(
          safeYieldOnCost
        )}, which suggests your portfolio is producing a meaningful level of dividend income.`,
      });
    }

    if (largestAllocation > 40 && largestPosition) {
      insights.push({
        title: "Concentration Risk",
        category: "Risk",
        priority: largestAllocation > 60 ? "High" : "Medium",
        message: `${largestPosition.symbol} is your largest position at ${percent(
          largestAllocation
        )} of your portfolio. This may require allocation review to reduce concentration risk.`,
      });
    } else if (largestPosition) {
      insights.push({
        title: "Allocation Balance",
        category: "Diversification",
        priority: "Low",
        message: `Your largest position is ${
          largestPosition.symbol
        } at ${percent(
          largestAllocation
        )} of your portfolio, which appears manageable based on the current rule threshold.`,
      });
    }

    if (assetTypes.length <= 1 && performance.length > 0) {
      insights.push({
        title: "Asset Type Concentration",
        category: "Diversification",
        priority: "Medium",
        message: `Your portfolio currently has ${number(
          performance.length
        )} holdings but only ${number(
          assetTypes.length
        )} asset type. Adding different asset classes may improve diversification.`,
      });
    }

    insights.push({
      title: "Goal Progress",
      category: "Goal",
      priority: goalProgress >= 50 ? "Low" : "Medium",
      message:
        goalProgress >= 50
          ? `You are ${percent(
              goalProgress
            )} toward your portfolio goal of ${money(
              safePortfolioGoal
            )}, which shows meaningful progress.`
          : `You are ${percent(
              goalProgress
            )} toward your portfolio goal of ${money(
              safePortfolioGoal
            )}. Regular contributions may help accelerate progress.`,
    });

    const executiveSummary = insights.map((item) => item.message).join(" ");

    res.json({
      success: true,
      executiveSummary,
      insights,
    });
  } catch (error) {
    console.error("AI insights error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI portfolio insights",
    });
  }
});

module.exports = router;
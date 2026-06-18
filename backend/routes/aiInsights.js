const express = require("express");
const router = express.Router();

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

    const goalProgress =
      portfolioGoal > 0 ? (totalValue / portfolioGoal) * 100 : 0;

    const largestPosition =
      performance.length > 0
        ? [...performance].sort(
            (a, b) => Number(b.currentValue || 0) - Number(a.currentValue || 0)
          )[0]
        : null;

    const largestAllocation =
      largestPosition && totalValue > 0
        ? (Number(largestPosition.currentValue || 0) / totalValue) * 100
        : 0;

    const assetTypes = [
      ...new Set(performance.map((item) => item.assetType || item.type || "Unknown")),
    ];

    const insights = [];

    insights.push({
      title: "Portfolio Overview",
      category: "Overview",
      priority: "Info",
      message: `Your portfolio is currently worth $${Number(totalValue).toFixed(2)}.`,
    });

    insights.push({
      title: "Income Analysis",
      category: "Income",
      priority: yieldOnCost < 1 ? "High" : "Medium",
      message: `You have received $${Number(totalDividends).toFixed(
        2
      )} in dividends, generating about $${Number(monthlyPassiveIncome).toFixed(
        2
      )} per month.`,
    });

    if (yieldOnCost < 1) {
      insights.push({
        title: "Income Opportunity",
        category: "Opportunity",
        priority: "High",
        message: `Income generation is currently low at ${Number(
          yieldOnCost
        ).toFixed(
          2
        )}% yield on cost. Consider reviewing dividend ETFs, REITs, or income-focused assets if passive income is one of your goals.`,
      });
    } else if (yieldOnCost < 3) {
      insights.push({
        title: "Income Improvement",
        category: "Opportunity",
        priority: "Medium",
        message: `Your yield on cost is ${Number(yieldOnCost).toFixed(
          2
        )}%. There may still be room to improve income generation depending on your investment objective.`,
      });
    } else {
      insights.push({
        title: "Income Strength",
        category: "Strength",
        priority: "Low",
        message: `Your yield on cost is ${Number(yieldOnCost).toFixed(
          2
        )}%, which suggests your portfolio is producing a meaningful level of dividend income.`,
      });
    }

    if (largestAllocation > 40 && largestPosition) {
      insights.push({
        title: "Concentration Risk",
        category: "Risk",
        priority: largestAllocation > 60 ? "High" : "Medium",
        message: `${largestPosition.symbol} is your largest position at ${largestAllocation.toFixed(
          2
        )}% of your portfolio. This may require allocation review to reduce concentration risk.`,
      });
    } else if (largestPosition) {
      insights.push({
        title: "Allocation Balance",
        category: "Diversification",
        priority: "Low",
        message: `Your largest position is ${largestPosition.symbol} at ${largestAllocation.toFixed(
          2
        )}% of your portfolio, which appears manageable based on the current rule threshold.`,
      });
    }

    if (assetTypes.length <= 1 && performance.length > 0) {
      insights.push({
        title: "Asset Type Concentration",
        category: "Diversification",
        priority: "Medium",
        message: `Your portfolio currently has ${performance.length} holdings but only ${assetTypes.length} asset type. Adding different asset classes may improve diversification.`,
      });
    }

    insights.push({
      title: "Goal Progress",
      category: "Goal",
      priority: goalProgress >= 50 ? "Low" : "Medium",
      message:
        goalProgress >= 50
          ? `You are ${goalProgress.toFixed(
              2
            )}% toward your portfolio goal, which shows meaningful progress.`
          : `You are ${goalProgress.toFixed(
              2
            )}% toward your portfolio goal. Regular contributions may help accelerate progress.`,
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
require("dotenv").config({ path: "./.env" });

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Database = require("better-sqlite3");
const PDFDocument = require("pdfkit");
const Parser = require("rss-parser");
const parser = new Parser();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);
app.use(express.json());

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, "etf.db"));

app.get("/api/backup-db", (req, res) => {
  const dbPath = path.join(__dirname, "data", "etf.db");

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({
      message: "Database not found",
    });
  }

  res.download(
    dbPath,
    `etf-backup-${new Date().toISOString().split("T")[0]}.db`
  );
});

const manualPrices = {
  FKIQX: 6.46,
  "0P0001EDGU.SI": 0.54,
  "0P00013206.SI": 1.01,
};

const assetNames = {
  FKIQX: "Franklin K2 Alternative Strategies Fund",
  "0P0001EDGU.SI":
    "Manulife Global Fund - Asia Pacific REIT Fund (SGD Hedged) MDIST(G)",
  "0P00013206.SI": "Amova Global Dividend Equity Fund - SGD Hedged MDis Cash",
  VWRA: "Vanguard FTSE All-World UCITS ETF",
  CSPX: "iShares Core S&P 500 UCITS ETF",
  VOO: "Vanguard S&P 500 ETF",
  SPY: "SPDR S&P 500 ETF",
  QQQ: "Invesco QQQ Trust",
  SCHD: "Schwab US Dividend Equity ETF",
};

/* =========================
   TABLES
========================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    type TEXT DEFAULT 'ETF',
    units REAL NOT NULL,
    buyPrice REAL NOT NULL,
    buyDate TEXT NOT NULL
  )
`).run();

try {
  db.prepare(`
    ALTER TABLE transactions
    ADD COLUMN type TEXT DEFAULT 'ETF'
  `).run();
} catch {}

db.prepare(`
  CREATE TABLE IF NOT EXISTS dividends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS target_allocations (
    symbol TEXT PRIMARY KEY,
    targetPercent REAL NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    value REAL NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS networth_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    netWorth REAL NOT NULL,
    totalAssets REAL NOT NULL,
    totalLiabilities REAL NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    addedDate TEXT NOT NULL
  )
`).run();

try {
  db.prepare(`
    ALTER TABLE watchlist
    ADD COLUMN targetPrice REAL DEFAULT 0
  `).run();
} catch {}

db.prepare(`
  CREATE TABLE IF NOT EXISTS dividend_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    expectedAmount REAL NOT NULL,
    expectedDate TEXT NOT NULL,
    notes TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`).run();

db.prepare(`
  INSERT OR IGNORE INTO settings (key, value)
  VALUES ('portfolioGoal', '100000')
`).run();

/* =========================
   PRICE FUNCTION
========================= */

async function getYahooPrice(symbol) {
  if (manualPrices[symbol]) return manualPrices[symbol];

  const yahooSymbols = {
    VWRA: "VWRA.L",
    CSPX: "CSPX.L",
    VOO: "VOO",
    SPY: "SPY",
    QQQ: "QQQ",
    SCHD: "SCHD",
    IWDA: "IWDA.L",
    SWRD: "SWRD.L",
    ES3: "ES3.SI",
    STI: "ES3.SI",
    FKIQX: "FKIQX",
  };

  const yahooSymbol = yahooSymbols[symbol];
  if (!yahooSymbol) return 0;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
    const response = await fetch(url);
    const data = await response.json();

    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    return 0;
  }
}

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Investment Tracker API running with SQLite",
  });
});

/* =========================
   SETTINGS
========================= */

app.get("/settings", (req, res) => {
  const goal = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("portfolioGoal");

  res.json({
    portfolioGoal: Number(goal?.value || 100000),
  });
});

app.put("/settings/goal", (req, res) => {
  const portfolioGoal = Number(req.body.portfolioGoal);

  if (!portfolioGoal || portfolioGoal <= 0) {
    return res.status(400).json({
      message: "Portfolio goal must be a positive number",
    });
  }

  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('portfolioGoal', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(String(portfolioGoal));

  res.json({
    message: "Portfolio goal updated",
    portfolioGoal,
  });
});

app.get("/settings/networth", (req, res) => {
  const result = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("netWorth");

  const defaultNetWorth = {
    cash: 10000,
    cpf: 50000,
    otherAssets: 0,
    loans: 0,
  };

  res.json(result ? JSON.parse(result.value) : defaultNetWorth);
});

app.put("/settings/networth", (req, res) => {
  const netWorth = {
    cash: Number(req.body.cash || 0),
    cpf: Number(req.body.cpf || 0),
    otherAssets: Number(req.body.otherAssets || 0),
    loans: Number(req.body.loans || 0),
  };

  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('netWorth', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(JSON.stringify(netWorth));

  res.json({
    message: "Net worth settings updated",
    data: netWorth,
  });
});

/* =========================
   TRANSACTIONS
========================= */

app.get("/transactions", (req, res) => {
  const transactions = db
    .prepare("SELECT * FROM transactions ORDER BY id DESC")
    .all();

  res.json({
    count: transactions.length,
    data: transactions,
  });
});

app.post("/transactions", (req, res) => {
  const result = db
    .prepare(`
      INSERT INTO transactions (symbol, type, units, buyPrice, buyDate)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      req.body.symbol.toUpperCase(),
      req.body.type || "ETF",
      Number(req.body.units),
      Number(req.body.buyPrice),
      req.body.buyDate
    );

  const transaction = db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({
    message: "Transaction added",
    data: transaction,
  });
});

app.put("/transactions/:id", (req, res) => {
  db.prepare(`
    UPDATE transactions
    SET symbol = ?, type = ?, units = ?, buyPrice = ?, buyDate = ?
    WHERE id = ?
  `).run(
    req.body.symbol.toUpperCase(),
    req.body.type || "ETF",
    Number(req.body.units),
    Number(req.body.buyPrice),
    req.body.buyDate,
    req.params.id
  );

  const transaction = db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(req.params.id);

  res.json({
    message: "Transaction updated",
    data: transaction,
  });
});

app.delete("/transactions/:id", (req, res) => {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);

  res.json({
    message: "Transaction deleted",
    id: req.params.id,
  });
});

/* =========================
   PORTFOLIO
========================= */

app.get("/portfolio/performance", async (req, res) => {
  const transactions = db.prepare("SELECT * FROM transactions").all();

  const currentPrices = {};

  for (const tx of transactions) {
    if (!currentPrices[tx.symbol]) {
      currentPrices[tx.symbol] = await getYahooPrice(tx.symbol);
    }
  }

  const summary = {};

  transactions.forEach((tx) => {
    if (!summary[tx.symbol]) {
      summary[tx.symbol] = {
        symbol: tx.symbol,
        type: tx.type || "ETF",
        totalUnits: 0,
        totalInvested: 0,
      };
    }

    summary[tx.symbol].totalUnits += tx.units;
    summary[tx.symbol].totalInvested += tx.units * tx.buyPrice;
  });

  const performance = Object.values(summary).map((item) => {
    const currentPrice = currentPrices[item.symbol] || 0;
    const averageCost =
      item.totalUnits > 0 ? item.totalInvested / item.totalUnits : 0;
    const currentValue = item.totalUnits * currentPrice;
    const profitLoss = currentValue - item.totalInvested;
    const profitLossPercent =
      item.totalInvested > 0 ? (profitLoss / item.totalInvested) * 100 : 0;

    return {
      symbol: item.symbol,
      name: assetNames[item.symbol] || item.symbol,
      type: item.type,
      totalUnits: item.totalUnits,
      averageCost: Number(averageCost.toFixed(2)),
      totalInvested: Number(item.totalInvested.toFixed(2)),
      currentPrice: Number(currentPrice.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      profitLoss: Number(profitLoss.toFixed(2)),
      profitLossPercent: Number(profitLossPercent.toFixed(2)),
    };
  });

  res.json({ performance });
});

app.get("/portfolio/trend", (req, res) => {
  const snapshots = db
    .prepare("SELECT date, value FROM snapshots ORDER BY date ASC")
    .all();

  res.json(snapshots);
});

app.post("/portfolio/snapshot", async (req, res) => {
  const transactions = db.prepare("SELECT * FROM transactions").all();

  let totalValue = 0;
  const currentPrices = {};

  for (const tx of transactions) {
    if (!currentPrices[tx.symbol]) {
      currentPrices[tx.symbol] = await getYahooPrice(tx.symbol);
    }

    totalValue += tx.units * currentPrices[tx.symbol];
  }

  const today = new Date().toISOString().split("T")[0];
  const value = Number(totalValue.toFixed(2));

  db.prepare(`
    INSERT INTO snapshots (date, value)
    VALUES (?, ?)
    ON CONFLICT(date) DO UPDATE SET value = excluded.value
  `).run(today, value);

  res.json({
    message: "Snapshot saved",
    data: {
      date: today,
      value,
    },
  });
});

app.get("/portfolio/stats", async (req, res) => {
  const transactions = db.prepare("SELECT * FROM transactions").all();
  const dividends = db.prepare("SELECT * FROM dividends").all();

  const currentPrices = {};
  let totalInvested = 0;
  let currentValue = 0;
  let totalDividends = 0;

  for (const tx of transactions) {
    if (!currentPrices[tx.symbol]) {
      currentPrices[tx.symbol] = await getYahooPrice(tx.symbol);
    }

    totalInvested += tx.units * tx.buyPrice;
    currentValue += tx.units * currentPrices[tx.symbol];
  }

  dividends.forEach((dividend) => {
    totalDividends += dividend.amount;
  });

  const profitLoss = currentValue - totalInvested;
  const yieldOnCost =
    totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0;

  const annualDividendIncome = totalDividends;
  const monthlyPassiveIncome = annualDividendIncome / 12;

  res.json({
    totalInvested: Number(totalInvested.toFixed(2)),
    currentValue: Number(currentValue.toFixed(2)),
    profitLoss: Number(profitLoss.toFixed(2)),
    totalDividends: Number(totalDividends.toFixed(2)),
    yieldOnCost: Number(yieldOnCost.toFixed(2)),
    annualDividendIncome: Number(annualDividendIncome.toFixed(2)),
    monthlyPassiveIncome: Number(monthlyPassiveIncome.toFixed(2)),
  });
});

/* =========================
   DIVIDENDS
========================= */

app.get("/dividends", (req, res) => {
  const dividends = db
    .prepare("SELECT * FROM dividends ORDER BY date DESC")
    .all();

  res.json({
    count: dividends.length,
    data: dividends,
  });
});

app.post("/dividends", (req, res) => {
  const result = db
    .prepare(`
      INSERT INTO dividends (symbol, amount, date)
      VALUES (?, ?, ?)
    `)
    .run(req.body.symbol.toUpperCase(), Number(req.body.amount), req.body.date);

  const dividend = db
    .prepare("SELECT * FROM dividends WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({
    message: "Dividend added",
    data: dividend,
  });
});

app.delete("/dividends/:id", (req, res) => {
  db.prepare("DELETE FROM dividends WHERE id = ?").run(req.params.id);

  res.json({
    message: "Dividend deleted",
    id: req.params.id,
  });
});

app.get("/dividends/summary", (req, res) => {
  const result = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS totalDividends FROM dividends")
    .get();

  const dividends = db
    .prepare("SELECT * FROM dividends ORDER BY date DESC")
    .all();

  res.json({
    totalDividends: Number(result.totalDividends.toFixed(2)),
    dividends,
  });
});

/* =========================
   NET WORTH HISTORY
========================= */

app.get("/networth/history", (req, res) => {
  const history = db
    .prepare(`
      SELECT date, netWorth, totalAssets, totalLiabilities
      FROM networth_snapshots
      ORDER BY date ASC
    `)
    .all();

  res.json(history);
});

app.post("/networth/snapshot", (req, res) => {
  const { netWorth, totalAssets, totalLiabilities } = req.body;

  const today = new Date().toISOString().split("T")[0];

  db.prepare(`
    INSERT INTO networth_snapshots (
      date,
      netWorth,
      totalAssets,
      totalLiabilities
    )
    VALUES (?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      netWorth = excluded.netWorth,
      totalAssets = excluded.totalAssets,
      totalLiabilities = excluded.totalLiabilities
  `).run(
    today,
    Number(netWorth),
    Number(totalAssets),
    Number(totalLiabilities)
  );

  res.json({
    message: "Net worth snapshot saved",
    data: {
      date: today,
      netWorth: Number(netWorth),
      totalAssets: Number(totalAssets),
      totalLiabilities: Number(totalLiabilities),
    },
  });
});

/* =========================
   WATCHLIST
========================= */

app.get("/watchlist", async (req, res) => {
  const items = db
    .prepare("SELECT * FROM watchlist ORDER BY symbol ASC")
    .all();

  const watchlist = [];

  for (const item of items) {
    const price = await getYahooPrice(item.symbol);
    const targetPrice = Number(item.targetPrice || 0);

    const distanceToTarget =
      targetPrice > 0 && price > 0
        ? ((price - targetPrice) / targetPrice) * 100
        : 0;

    const status =
      targetPrice > 0 && price <= targetPrice
        ? "Buy Zone"
        : targetPrice > 0
        ? "Wait"
        : "No Target";

    watchlist.push({
      ...item,
      name: assetNames[item.symbol] || item.symbol,
      currentPrice: price,
      targetPrice,
      distanceToTarget: Number(distanceToTarget.toFixed(2)),
      status,
    });
  }

  res.json(watchlist);
});

app.post("/watchlist", (req, res) => {
  const symbol = req.body.symbol.toUpperCase();
  const targetPrice = Number(req.body.targetPrice || 0);

  db.prepare(`
    INSERT INTO watchlist (
      symbol,
      addedDate,
      targetPrice
    )
    VALUES (?, ?, ?)
    ON CONFLICT(symbol) DO UPDATE SET
      targetPrice = excluded.targetPrice
  `).run(symbol, new Date().toISOString().split("T")[0], targetPrice);

  res.json({
    message: "Added to watchlist",
    symbol,
    targetPrice,
  });
});

app.delete("/watchlist/:id", (req, res) => {
  db.prepare("DELETE FROM watchlist WHERE id = ?").run(req.params.id);

  res.json({
    message: "Removed from watchlist",
  });
});

/* =========================
   DIVIDEND CALENDAR
========================= */

app.get("/dividend-calendar", (req, res) => {
  const items = db
    .prepare("SELECT * FROM dividend_calendar ORDER BY expectedDate ASC")
    .all();

  res.json(items);
});

app.post("/dividend-calendar", (req, res) => {
  const result = db
    .prepare(`
      INSERT INTO dividend_calendar (
        symbol,
        expectedAmount,
        expectedDate,
        notes
      )
      VALUES (?, ?, ?, ?)
    `)
    .run(
      req.body.symbol.toUpperCase(),
      Number(req.body.expectedAmount),
      req.body.expectedDate,
      req.body.notes || ""
    );

  const item = db
    .prepare("SELECT * FROM dividend_calendar WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({
    message: "Dividend calendar item added",
    data: item,
  });
});

app.delete("/dividend-calendar/:id", (req, res) => {
  db.prepare("DELETE FROM dividend_calendar WHERE id = ?").run(req.params.id);

  res.json({
    message: "Dividend calendar item deleted",
    id: req.params.id,
  });
});

/* =========================
   PDF WEALTH REPORT
========================= */

app.get("/report/wealth", async (req, res) => {
  const transactions = db.prepare("SELECT * FROM transactions").all();
  const dividends = db.prepare("SELECT * FROM dividends").all();

  const netWorthRow = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("netWorth");

  const netWorthSettings = netWorthRow
    ? JSON.parse(netWorthRow.value)
    : { cash: 0, cpf: 0, otherAssets: 0, loans: 0 };

  const money = (value) =>
    `$${Number(value || 0).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const percent = (value) => `${Number(value || 0).toFixed(2)}%`;

  const currentPrices = {};
  let totalInvested = 0;
  let currentValue = 0;

  for (const tx of transactions) {
    if (!currentPrices[tx.symbol]) {
      currentPrices[tx.symbol] = await getYahooPrice(tx.symbol);
    }

    totalInvested += tx.units * tx.buyPrice;
    currentValue += tx.units * currentPrices[tx.symbol];
  }

  const totalDividends = dividends.reduce(
    (sum, dividend) => sum + dividend.amount,
    0
  );

  const monthlyPassiveIncome = totalDividends / 12;
  const profitLoss = currentValue - totalInvested;

  const cash = Number(netWorthSettings.cash || 0);
  const cpf = Number(netWorthSettings.cpf || 0);
  const otherAssets = Number(netWorthSettings.otherAssets || 0);
  const loans = Number(netWorthSettings.loans || 0);

  const totalAssets = currentValue + cash + cpf + otherAssets;
  const netWorth = totalAssets - loans;

  const totalAllocation = currentValue + cash + cpf + otherAssets;

  const goalRow = db
  .prepare("SELECT value FROM settings WHERE key = ?")
  .get("portfolioGoal");

  const portfolioGoal = Number(goalRow?.value || 100000);
  const portfolioGoalProgress =
    portfolioGoal > 0 ? (currentValue / portfolioGoal) * 100 : 0;

  const doc = new PDFDocument({
    size: "A4",
    margin: 36,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=wealth-report.pdf"
  );

  doc.pipe(res);

  const left = 36;
  const right = doc.page.width - 36;

  const drawDivider = () => {
    doc.x = left;

    doc
      .moveTo(left, doc.y)
      .lineTo(right, doc.y)
      .strokeColor("#d1d5db")
      .lineWidth(0.6)
      .stroke();

    doc.fillColor("#000000");
    doc.moveDown(0.25);
    doc.x = left;
  };

  const sectionTitle = (title) => {
    doc.x = left;

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text(title.toUpperCase(), left);

    doc.moveDown(0.2);
    drawDivider();
    doc.moveDown(0.3);

    doc.x = left;
  };

  const sectionGap = () => {
    doc.moveDown(1.2);
    doc.x = left;
  };

  const row = (label, value, x = left, valueX = 280) => {
    const y = doc.y;

    doc.fontSize(8.8).fillColor("#475569").text(label, x, y);
    doc.fontSize(8.8).fillColor("#000000").text(value, valueX, y);

    doc.y = y + 12;
    doc.x = left;
  };

  doc.x = left;

  doc
    .fontSize(19)
    .fillColor("#000000")
    .text("Investment Wealth Report", left, 34);

  doc
    .fontSize(8.5)
    .fillColor("#64748b")
    .text(`Generated: ${new Date().toLocaleDateString("en-SG")}`, left, 56);

  doc.y = 78;
  doc.x = left;

  sectionTitle("Executive Summary");

  row("Net Worth", money(netWorth));
  row("Portfolio Value", money(currentValue));
  row("Total Invested", money(totalInvested));
  row("Profit / Loss", money(profitLoss));
  row("Total Dividends", money(totalDividends));
  row("Monthly Passive Income", money(monthlyPassiveIncome));
  row("Portfolio Goal Progress", percent(portfolioGoalProgress));

  sectionGap();

  sectionTitle("Portfolio Holdings");

  const headerY = doc.y;

  doc.fontSize(8).fillColor("#64748b");
  doc.text("Symbol / Fund", left, headerY);
  doc.text("Units", 300, headerY);
  doc.text("Avg Cost", 380, headerY);
  doc.text("Value", 465, headerY);

  doc.y = headerY + 12;
  doc.x = left;
  drawDivider();

  const summary = {};

  transactions.forEach((tx) => {
    if (!summary[tx.symbol]) {
      summary[tx.symbol] = {
        units: 0,
        invested: 0,
      };
    }

    summary[tx.symbol].units += tx.units;
    summary[tx.symbol].invested += tx.units * tx.buyPrice;
  });

  Object.entries(summary).forEach(([symbol, data]) => {
    const avgCost = data.units > 0 ? data.invested / data.units : 0;
    const currentVal = data.units * (currentPrices[symbol] || 0);
    const assetName = assetNames[symbol] || symbol;

    const startY = doc.y;

    doc.fontSize(8.2).fillColor("#000000").text(symbol, left, startY, {
      width: 82,
    });

    doc.fontSize(6.8).fillColor("#64748b").text(assetName, left + 84, startY, {
      width: 175,
    });

    doc.fontSize(8.2).fillColor("#000000").text(
      Number(data.units || 0).toLocaleString("en-SG", {
        maximumFractionDigits: 2,
      }),
      300,
      startY,
      { width: 65 }
    );

    doc.text(money(avgCost), 380, startY, { width: 70 });
    doc.text(money(currentVal), 465, startY, { width: 80 });

    doc.y = startY + 20;
    doc.x = left;
  });

  sectionGap();

  sectionTitle("Net Worth");

  const netWorthHeaderY = doc.y;

  doc.fontSize(8).fillColor("#64748b");
  doc.text("Item", left, netWorthHeaderY);
  doc.text("Amount", 320, netWorthHeaderY);

  doc.y = netWorthHeaderY + 12;
  doc.x = left;
  drawDivider();

  [
    ["Cash", money(cash)],
    ["CPF / Retirement Funds", money(cpf)],
    ["Other Assets", money(otherAssets)],
    ["Loans / Liabilities", `(${money(loans)})`],
    ["Total Assets", money(totalAssets)],
    ["Net Worth", money(netWorth)],
  ].forEach(([label, value]) => {
    const y = doc.y;

    doc.fontSize(8.8).fillColor("#475569").text(label, left, y);
    doc.fontSize(8.8).fillColor("#000000").text(value, 320, y);

    doc.y = y + 13;
    doc.x = left;
  });

  sectionGap();

  sectionTitle("Asset Allocation");

  if (totalAllocation > 0) {
    doc.x = left;

    doc
      .fontSize(8.8)
      .fillColor("#000000")
      .text(
        `Investments ${percent(
          (currentValue / totalAllocation) * 100
        )}   |   Cash ${percent((cash / totalAllocation) * 100)}   |   CPF ${percent(
          (cpf / totalAllocation) * 100
        )}   |   Other Assets ${percent((otherAssets / totalAllocation) * 100)}`,
        left,
        doc.y,
        { width: right - left }
      );
  }

  sectionGap();

  sectionTitle("Milestones");

  doc.x = left;
  doc.fontSize(8.8).fillColor("#000000");

  doc.text(
    `${currentValue >= 10000 ? "[Done]" : "[Pending]"} Portfolio $10K     ${
      currentValue >= 50000 ? "[Done]" : "[Pending]"
    } Portfolio $50K     ${currentValue >= 100000 ? "[Done]" : "[Pending]"} Portfolio $100K`,
    left,
    doc.y,
    { width: right - left }
  );

  doc.moveDown(0.2);
  doc.x = left;

  doc.text(
    `${netWorth >= 100000 ? "[Done]" : "[Pending]"} Net Worth $100K     ${
      netWorth >= 500000 ? "[Done]" : "[Pending]"
    } Net Worth $500K     ${netWorth >= 1000000 ? "[Done]" : "[Pending]"} Net Worth $1M`,
    left,
    doc.y,
    { width: right - left }
  );

  doc.moveDown(0.35);
  doc.x = left;

  doc.fontSize(8.4).fillColor("#475569");
  doc.text(`Next Portfolio Milestone: ${money(100000)}`, left);
  doc.text(
    `Remaining to $100K Portfolio: ${money(Math.max(100000 - currentValue, 0))}`,
    left
  );
  doc.text(`Next Net Worth Milestone: ${money(1500000)}`, left);
  doc.text(
    `Remaining to $1.5M Net Worth: ${money(Math.max(1500000 - netWorth, 0))}`,
    left
  );

  doc.fontSize(7.8).fillColor("#64748b");
  doc.text("Generated by Investment Wealth Tracker", left, 775, {
    align: "center",
  });
  doc.text("For personal financial tracking only.", {
    align: "center",
  });

  doc.end();
});

app.get("/news", async (req, res) => {
  try {
    const holdings = db
      .prepare("SELECT DISTINCT symbol FROM transactions")
      .all();

    const searchTerms = holdings.map((item) => {
      const symbol = item.symbol;

      return {
        symbol,
        query: assetNames[symbol]
          ? assetNames[symbol]
          : `${symbol} ETF`,
      };
    });

    if (searchTerms.length === 0) {
      searchTerms.push(
        {
          symbol: "ETF",
          query: "ETF market news",
        },
        {
          symbol: "S&P500",
          query: "S&P 500 ETF news",
        },
        {
          symbol: "Mutual Fund",
          query: "global mutual fund news",
        },
        {
          symbol: "Dividend Fund",
          query: "global dividend fund news",
        },
        {
          symbol: "REIT",
          query: "REIT market news",
        }
      );
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const news = [];

    for (const term of searchTerms) {
      try {
        const feedUrl =
          `https://news.google.com/rss/search?q=` +
          encodeURIComponent(term.query) +
          `&hl=en-SG&gl=SG&ceid=SG:en`;

        const feed = await parser.parseURL(feedUrl);

        feed.items.forEach((item) => {
          const publishedDate = new Date(item.pubDate);

          if (publishedDate >= oneYearAgo) {
            news.push({
              title: item.title,
              link: item.link,
              source:
                item.source?.title ||
                "Google News",
              date: item.pubDate,
              relatedTo: term.query,
              affects: term.symbol,
              impact: getNewsImpact(item.title),
            });
          }
        });
      } catch (error) {
        console.log(
          `News fetch failed for ${term.query}`
        );
      }
    }

    const uniqueNews = Array.from(
      new Map(
        news.map((item) => [
          item.title,
          item,
        ])
      ).values()
    );

    uniqueNews.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    res.json(uniqueNews.slice(0, 12));
  } catch (error) {
    console.error(
      "News fetch error:",
      error.message
    );

    res.status(500).json({
      message:
        "Unable to fetch market news",
    });
  }
});

function getNewsImpact(title) {
  const text = title.toLowerCase();

  const positiveWords = [
    "rally",
    "surge",
    "gain",
    "gains",
    "growth",
    "record high",
    "bull market",
    "upgrade",
    "upgraded",
    "beat earnings",
    "strong earnings",
    "rate cut",
    "cuts rates",
    "rebound",
    "outperform",
    "higher",
    "boost",
    "positive",
    "dividend increase",
  ];

  const negativeWords = [
    "selloff",
    "sell-off",
    "fall",
    "falls",
    "drop",
    "drops",
    "crash",
    "downgrade",
    "downgraded",
    "inflation",
    "recession",
    "rate hike",
    "hikes rates",
    "lawsuit",
    "miss earnings",
    "weak earnings",
    "loss",
    "losses",
    "lower",
    "warning",
    "risk",
    "slump",
    "negative",
    "dividend cut",
  ];

  const hasPositive = positiveWords.some((word) => text.includes(word));
  const hasNegative = negativeWords.some((word) => text.includes(word));

  if (hasPositive && !hasNegative) return "Positive";
  if (hasNegative && !hasPositive) return "Negative";

  return "Neutral";
}

app.get("/target-allocations", (req, res) => {
  const rows = db
    .prepare("SELECT symbol, targetPercent FROM target_allocations")
    .all();

  const targets = {};

  rows.forEach((row) => {
    targets[row.symbol] = row.targetPercent;
  });

  res.json(targets);
});

app.put("/target-allocations", (req, res) => {
  const targets = req.body.targets || {};

  const insert = db.prepare(`
    INSERT INTO target_allocations (symbol, targetPercent)
    VALUES (?, ?)
    ON CONFLICT(symbol) DO UPDATE SET
      targetPercent = excluded.targetPercent
  `);

  const saveMany = db.transaction((items) => {
    Object.entries(items).forEach(([symbol, targetPercent]) => {
      insert.run(symbol.toUpperCase(), Number(targetPercent || 0));
    });
  });

  saveMany(targets);

  res.json({
    message: "Target allocations saved",
    targets,
  });
});

/* HEALTH CHECK */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
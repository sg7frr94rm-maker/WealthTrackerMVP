import { useEffect, useState } from "react";

import {
  getPerformance,
  getTransactions,
  getTrend,
  getDividends,
  getStats,
  getSettings,
  getNetWorthSettings,
  updatePortfolioGoal,
  saveSnapshot,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addDividend,
  deleteDividend,
  downloadWealthReport,
  getDividendCalendar,
  backupDatabase,
} from "./api/portfolioApi";

import MetricCard from "./components/MetricCard";
import WealthDashboardSummary from "./components/WealthDashboardSummary";
import { AnimatePresence, motion } from "framer-motion";
import MarketNews from "./components/MarketNews";
import MilestoneTabs from "./components/MilestoneTabs";
import IncomeTabs from "./components/IncomeTabs";
import WealthTabs from "./components/WealthTabs";
import PortfolioTabs from "./components/PortfolioTabs";
import DashboardInsightsTabs from "./components/DashboardInsightsTabs";
import GoalsTabs from "./components/GoalsTabs";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [performance, setPerformance] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [dividendCalendar, setDividendCalendar] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [portfolioGoal, setPortfolioGoal] = useState(100000);
  
  const [netWorthData, setNetWorthData] = useState({
  cash: 0,
  cpf: 0,
  otherAssets: 0,
  loans: 0,
  });

  const [form, setForm] = useState({
    symbol: "",
    type: "ETF",
    units: "",
    buyPrice: "",
    buyDate: "",
  });

  const [dividendForm, setDividendForm] = useState({
    symbol: "",
    amount: "",
    date: "",
  });

  const fetchData = async () => {
  try {
    const [
      performanceRes,
      transactionsRes,
      trendRes,
      dividendsRes,
      statsRes,
      settingsRes,
      dividendCalendarRes,
      netWorthRes,
    ] = await Promise.all([
      getPerformance(),
      getTransactions(),
      getTrend(),
      getDividends(),
      getStats(),
      getSettings(),
      getDividendCalendar(),
      getNetWorthSettings(),
    ]);
    setPerformance(performanceRes.data.performance);
    setTransactions(transactionsRes.data.data);
    setTrendData(trendRes.data);
    setDividends(dividendsRes.data.data);
    setStats(statsRes.data);
    setPortfolioGoal(settingsRes.data.portfolioGoal);
    setDividendCalendar(dividendCalendarRes.data || []);
    setNetWorthData(netWorthRes.data);
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSnapshot = async () => {
    await saveSnapshot();
    fetchData();
  };

  const handleDownloadReport = () => {
    downloadWealthReport();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDividendChange = (e) => {
    setDividendForm({ ...dividendForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      symbol: form.symbol.toUpperCase(),
      type: form.type,
      units: Number(form.units),
      buyPrice: Number(form.buyPrice),
      buyDate: form.buyDate,
    };

    if (editingId) {
      await updateTransaction(editingId, payload);
      setEditingId(null);
    } else {
      try {
        await addTransaction(payload);
        fetchData();
          } catch (error) {
            console.error(error);
            alert("Failed to save transaction");
          }
    }

    setForm({
      symbol: "",
      type: "ETF",
      units: "",
      buyPrice: "",
      buyDate: "",
    });

    fetchData();
  };

  const handleDividendSubmit = async (e) => {
    e.preventDefault();

    await addDividend({
      symbol: dividendForm.symbol.toUpperCase(),
      amount: Number(dividendForm.amount),
      date: dividendForm.date,
    });

    setDividendForm({
      symbol: "",
      amount: "",
      date: "",
    });

    fetchData();
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);

    setForm({
      symbol: tx.symbol,
      type: tx.type || "ETF",
      units: tx.units,
      buyPrice: tx.buyPrice,
      buyDate: tx.buyDate,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    fetchData();
  };

  const handleDividendDelete = async (id) => {
    if (!window.confirm("Delete this dividend?")) return;
    await deleteDividend(id);
    fetchData();
  };

  const totalValue = stats?.currentValue || 0;
  const totalInvested = stats?.totalInvested || 0;
  const totalProfitLoss = stats?.profitLoss || 0;
  const totalDividends = stats?.totalDividends || 0;
  const yieldOnCost = stats?.yieldOnCost || 0;
  const totalDividendIncome = stats?.annualDividendIncome || 0;
  const monthlyPassiveIncome = stats?.monthlyPassiveIncome || 0;

  const cash = Number(netWorthData.cash || 0);
  const cpf = Number(netWorthData.cpf || 0);
  const otherAssets = Number(netWorthData.otherAssets || 0);
  const loans = Number(netWorthData.loans || 0);

  const netWorth =
    totalValue +
    cash +
    cpf +
    otherAssets -
    loans;

  const fireNumber = 900000;

  const fireProgress =
    fireNumber > 0
      ? (netWorth / fireNumber) * 100
      : 0;

  const totalReturnPercent =
    totalInvested > 0
      ? ((totalProfitLoss + totalDividends) / totalInvested) * 100
      : 0;

  const goalProgress =
    portfolioGoal > 0 ? (totalValue / portfolioGoal) * 100 : 0;

  const allocationData = performance.map((item) => ({
    name: item.symbol,
    value: item.currentValue,
  }));

  const assetTypeData = Object.values(
    performance.reduce((acc, item) => {
      const type = item.type || "ETF";

      if (!acc[type]) {
        acc[type] = {
          name: type,
          value: 0,
        };
      }

      acc[type].value += item.currentValue;
      return acc;
    }, {})
  );

  const largestPosition =
    performance.length > 0
      ? [...performance].sort(
          (a, b) => b.currentValue - a.currentValue
        )[0]
      : null;

  const bestPerformer =
    performance.length > 0
      ? [...performance].sort(
          (a, b) => b.profitLossPercent - a.profitLossPercent
        )[0]
      : null;

  const worstPerformer =
    performance.length > 0
      ? [...performance].sort(
          (a, b) => a.profitLossPercent - b.profitLossPercent
        )[0]
      : null;

  const largestAssetType =
    assetTypeData.length > 0
      ? [...assetTypeData].sort(
          (a, b) => b.value - a.value
        )[0]
      : null;

  const concentrationPercent =
    largestPosition && totalValue > 0
      ? (largestPosition.currentValue / totalValue) * 100
      : 0;

  const diversificationScore =
    concentrationPercent > 80
      ? 35
      : concentrationPercent > 60
      ? 55
      : concentrationPercent > 40
      ? 75
      : 90;

  const incomeScore =
    yieldOnCost >= 4
      ? 90
      : yieldOnCost >= 2
      ? 70
      : yieldOnCost >= 1
      ? 55
      : 40;

  const goalScore =
    goalProgress >= 75
      ? 90
      : goalProgress >= 50
      ? 75
      : goalProgress >= 25
      ? 60
      : 40;

  const overallHealthScore = Math.round(
    (diversificationScore + incomeScore + goalScore) / 3
  );

  const riskLevel =
    concentrationPercent > 80
      ? "High Concentration Risk"
      : concentrationPercent > 60
      ? "Moderate Concentration Risk"
      : "Healthy Diversification";

  const strengths = [];
  const opportunities = [];

  if (totalValue >= 50000) {
    strengths.push("Strong portfolio base above $50,000.");
  }

  if (goalProgress >= 50) {
    strengths.push("Good progress toward your financial goal.");
  }

  if (totalReturnPercent >= 0) {
    strengths.push("Portfolio is currently maintaining capital.");
  }

  if (assetTypeData.length === 1) {
    opportunities.push("Portfolio is concentrated in a single asset type.");
  }

  if (yieldOnCost < 2) {
    opportunities.push(
      "Dividend income can be improved with income-focused assets."
    );
  }

  if (concentrationPercent > 40) {
    opportunities.push(
      "Largest position exceeds 40%; diversification may reduce risk."
    );
  }

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Investment Wealth Tracker
          </h1>

          <p className="mt-3 text-slate-400">
            Track ETFs, mutual funds, returns, allocation, dividends and history.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={fetchData}
              className="rounded-lg bg-slate-800 px-4 py-2 font-semibold hover:bg-slate-700"
            >
              Refresh Prices
            </button>

            <button
              onClick={handleSnapshot}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500"
            >
              Save Snapshot
            </button>

            <button
              onClick={handleDownloadReport}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500"
            >
              Generate Wealth Report
            </button>
          </div>
        </header>

        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
            Dashboard
          </TabButton>
          <TabButton active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")}>
            Portfolio
          </TabButton>
          <TabButton active={activeTab === "news"} onClick={() => setActiveTab("news")}>
            News
          </TabButton>
          <TabButton active={activeTab === "income"} onClick={() => setActiveTab("income")}>
            Income
          </TabButton>
          <TabButton active={activeTab === "goals"} onClick={() => setActiveTab("goals")}>
            Goals
          </TabButton>
          <TabButton active={activeTab === "wealth"} onClick={() => setActiveTab("wealth")}>
            Wealth
          </TabButton>
          <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
            Reports
          </TabButton>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 14 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -14 }}
             transition={{ duration: 0.25, ease: "easeInOut" }}
         >

        {activeTab === "dashboard" && (
          <>
            <WealthDashboardSummary
             netWorth={netWorth}
             portfolioValue={totalValue}
             portfolioGoal={portfolioGoal}
             monthlyPassiveIncome={monthlyPassiveIncome}
             monthlyIncomeGoal={100}
             fireNumber={fireNumber}
             totalDividends={totalDividends}
             dividendCalendar={dividendCalendar}
             performance={performance}
            />

            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard title="Total Invested" value={`$${totalInvested.toFixed(2)}`} />
              <MetricCard title="Profit/Loss" value={`$${totalProfitLoss.toFixed(2)}`} positive={totalProfitLoss >= 0} />
              <MetricCard title="Total Return" value={`${totalReturnPercent.toFixed(2)}%`} positive={totalReturnPercent >= 0} />
              <MetricCard title="Dividends" value={`$${totalDividends.toFixed(2)}`} positive />
              <MetricCard title="Yield on Cost" value={`${yieldOnCost.toFixed(2)}%`} positive />
              <MetricCard title="Annual Dividend Income" value={`$${totalDividendIncome.toFixed(2)}`} positive />
            </section>

            <DashboardInsightsTabs
              performance={performance}
              totalValue={totalValue}
              monthlyPassiveIncome={monthlyPassiveIncome}
              monthlyIncomeGoal={100}
              dividendCalendar={dividendCalendar}
              totalDividends={totalDividends}
              portfolioGoal={portfolioGoal}
              strengths={strengths}
              opportunities={opportunities}
              riskLevel={riskLevel}
              overallHealthScore={overallHealthScore}
              diversificationScore={diversificationScore}
              incomeScore={incomeScore}
              goalScore={goalScore}
              largestPosition={largestPosition}
              bestPerformer={bestPerformer}
              worstPerformer={worstPerformer}
              largestAssetType={largestAssetType}
            />

          </>
        )}
        
        {activeTab === "news" && (
           <>
             <MarketNews />
           </>
         )}
        
        {activeTab === "portfolio" && (
           <PortfolioTabs
             performance={performance}
             transactions={transactions}
             totalValue={totalValue}
             allocationData={allocationData}
             assetTypeData={assetTypeData}
             colors={colors}
             form={form}
             setForm={setForm}
             editingId={editingId}
             handleChange={handleChange}
             handleSubmit={handleSubmit}
             handleEdit={handleEdit}
             handleDelete={handleDelete}
           />
         )}

        {activeTab === "income" && (
          <IncomeTabs
            monthlyPassiveIncome={monthlyPassiveIncome}
            totalDividends={totalDividends}
            totalValue={totalValue}
            dividendForm={dividendForm}
            handleDividendChange={handleDividendChange}
            handleDividendSubmit={handleDividendSubmit}
            dividends={dividends}
            handleDividendDelete={handleDividendDelete}
          />
        )}

        {activeTab === "goals" && (
          <GoalsTabs
            portfolioGoal={portfolioGoal}
            totalValue={totalValue}
            goalProgress={goalProgress}
            updatePortfolioGoal={updatePortfolioGoal}
            fetchData={fetchData}
            performance={performance}
          />
        )}

        {activeTab === "wealth" && (
          <WealthTabs
            totalValue={totalValue}
            portfolioGoal={portfolioGoal}
            trendData={trendData}
            netWorth={netWorth}
            cash={cash}
            cpf={cpf}
            otherAssets={otherAssets}
            loans={loans}
          />
        )}

        {activeTab === "reports" && (
         <>
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
          <h2 className="text-xl font-bold">Reports</h2>
          <p className="mt-2 text-slate-400">
              Generate a one-page PDF summary of your portfolio, net worth, allocation and milestones.
          </p>

          <button
            onClick={handleDownloadReport}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
          >
            Generate Wealth Report
          </button>

          <button
            onClick={backupDatabase}
            className="ml-3 mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
        Backup Database
      </button>
    </section>

    <MilestoneTabs
      portfolioValue={totalValue}
      portfolioGoal={portfolioGoal}
      totalDividends={totalDividends}
      monthlyPassiveIncome={monthlyPassiveIncome}
      netWorth={netWorth}
      fireProgress={fireProgress}
    />
  </>
)}

        </motion.div>
      </AnimatePresence>

      </div>
    </div>
  );
};

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-5 py-3 font-semibold transition-all duration-300 ${
        active
      ? "scale-105 bg-emerald-600 text-white shadow-lg shadow-emerald-700/40"
      : "bg-slate-800 text-slate-300 hover:scale-105 hover:bg-slate-700 hover:text-white"
    }`}
    >
      {children}
    </button>
  );
};

export default App;
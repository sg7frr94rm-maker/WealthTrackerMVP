import { useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

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

import { AnimatePresence, motion } from "framer-motion";
import MarketNews from "./components/MarketNews";
import MilestoneTabs from "./components/MilestoneTabs";
import WealthTabs from "./components/WealthTabs";
import PortfolioTabs from "./components/PortfolioTabs";
import DashboardInsightsTabs from "./components/DashboardInsightsTabs";
import GoalsTabs from "./components/GoalsTabs";
import WealthDashboardSummary from "./components/WealthDashboardSummary";

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <WealthTrackerApp signOut={signOut} user={user} />
      )}
    </Authenticator>
  );
}

function WealthTrackerApp({ signOut, user }) {
  const [activeTab, setActiveTab] = useState("wealth");
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

      setPerformance(performanceRes.data.performance || []);
      setTransactions(transactionsRes.data.data || []);
      setTrendData(trendRes.data || []);
      setDividends(dividendsRes.data.data || []);
      setStats(statsRes.data || null);
      setPortfolioGoal(Number(settingsRes.data.portfolioGoal || 100000));
      setDividendCalendar(dividendCalendarRes.data || []);
      setNetWorthData(netWorthRes.data || {});
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

    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
        setEditingId(null);
      } else {
        await addTransaction(payload);
      }

      setForm({
        symbol: "",
        type: "ETF",
        units: "",
        buyPrice: "",
        buyDate: "",
      });

      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save transaction");
    }
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

  const totalValue = Number(stats?.currentValue || 0);
  const totalInvested = Number(stats?.totalInvested || 0);
  const totalProfitLoss = Number(stats?.profitLoss || 0);
  const totalDividends = Number(stats?.totalDividends || 0);
  const yieldOnCost = Number(stats?.yieldOnCost || 0);
  const monthlyPassiveIncome = Number(stats?.monthlyPassiveIncome || 0);

  const cash = Number(netWorthData.cash || 0);
  const cpf = Number(netWorthData.cpf || 0);
  const otherAssets = Number(netWorthData.otherAssets || 0);
  const loans = Number(netWorthData.loans || 0);

  const netWorth = totalValue + cash + cpf + otherAssets - loans;

  const totalReturnPercent =
    totalInvested > 0
      ? ((totalProfitLoss + totalDividends) / totalInvested) * 100
      : 0;

  const goalProgress =
    portfolioGoal > 0 ? (totalValue / portfolioGoal) * 100 : 0;

  const allocationData = performance.map((item) => ({
    name: item.symbol,
    value: Number(item.currentValue || 0),
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

      acc[type].value += Number(item.currentValue || 0);
      return acc;
    }, {})
  );

  const largestPosition =
    performance.length > 0
      ? [...performance].sort(
          (a, b) => Number(b.currentValue || 0) - Number(a.currentValue || 0)
        )[0]
      : null;

  const bestPerformer =
    performance.length > 0
      ? [...performance].sort(
          (a, b) =>
            Number(b.profitLossPercent || 0) -
            Number(a.profitLossPercent || 0)
        )[0]
      : null;

  const worstPerformer =
    performance.length > 0
      ? [...performance].sort(
          (a, b) =>
            Number(a.profitLossPercent || 0) -
            Number(b.profitLossPercent || 0)
        )[0]
      : null;

  const concentrationPercent =
    largestPosition && totalValue > 0
      ? (Number(largestPosition.currentValue || 0) / totalValue) * 100
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
    yieldOnCost >= 4 ? 90 : yieldOnCost >= 2 ? 70 : yieldOnCost >= 1 ? 55 : 40;

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

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Wealth Investment Tracker
          </h1>

          <p className="mt-3 text-slate-400">
            Track ETFs, mutual funds, returns, allocation, dividends and
            long-term wealth progress.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Signed in as {user?.signInDetails?.loginId || user?.username}
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

            <button
              onClick={signOut}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          <TabButton active={activeTab === "wealth"} onClick={() => setActiveTab("wealth")}>
            Wealth
          </TabButton>

          <TabButton active={activeTab === "networth"} onClick={() => setActiveTab("networth")}>
            Net Worth
          </TabButton>

          <TabButton active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")}>
            Portfolio
          </TabButton>

          <TabButton active={activeTab === "insights"} onClick={() => setActiveTab("insights")}>
            Insights
          </TabButton>

          <TabButton active={activeTab === "market"} onClick={() => setActiveTab("market")}>
            Market
          </TabButton>

          <TabButton active={activeTab === "planning"} onClick={() => setActiveTab("planning")}>
            Planning
          </TabButton>

          <TabButton active={activeTab === "achievements"} onClick={() => setActiveTab("achievements")}>
            Achievements
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
            {activeTab === "wealth" && (
              <WealthDashboardSummary
                netWorth={netWorth}
                portfolioValue={totalValue}
                portfolioGoal={portfolioGoal}
                monthlyPassiveIncome={monthlyPassiveIncome}
                monthlyIncomeGoal={100}
                totalDividends={totalDividends}
                dividendCalendar={dividendCalendar}
                performance={performance}
                trendData={trendData}
                totalReturnPercent={totalReturnPercent}
                goalProgress={goalProgress}
                bestPerformer={bestPerformer}
                worstPerformer={worstPerformer}
              />
            )}

            {activeTab === "networth" && (
              <WealthTabs
                totalValue={totalValue}
                portfolioGoal={portfolioGoal}
                netWorth={netWorth}
                cash={cash}
                cpf={cpf}
                otherAssets={otherAssets}
                loans={loans}
              />
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
                monthlyPassiveIncome={monthlyPassiveIncome}
                totalDividends={totalDividends}
                dividendForm={dividendForm}
                handleDividendChange={handleDividendChange}
                handleDividendSubmit={handleDividendSubmit}
                dividends={dividends}
                handleDividendDelete={handleDividendDelete}
              />
            )}

            {activeTab === "insights" && (
              <DashboardInsightsTabs
                performance={performance}
                totalValue={totalValue}
                monthlyPassiveIncome={monthlyPassiveIncome}
                monthlyIncomeGoal={100}
                dividendCalendar={dividendCalendar}
                totalDividends={totalDividends}
                portfolioGoal={portfolioGoal}
                yieldOnCost={yieldOnCost}
                riskLevel={riskLevel}
                overallHealthScore={overallHealthScore}
                diversificationScore={diversificationScore}
                incomeScore={incomeScore}
                goalScore={goalScore}
                largestPosition={largestPosition}
                bestPerformer={bestPerformer}
                worstPerformer={worstPerformer}
                netWorth={netWorth}
              />
            )}

            {activeTab === "market" && <MarketNews />}

            {activeTab === "planning" && (
              <GoalsTabs
                portfolioGoal={portfolioGoal}
                totalValue={totalValue}
                netWorth={netWorth}
                goalProgress={goalProgress}
                updatePortfolioGoal={updatePortfolioGoal}
                fetchData={fetchData}
                performance={performance}
              />
            )}

            {activeTab === "achievements" && (
              <>
                <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
                  <h2 className="text-xl font-bold">Reports</h2>

                  <p className="mt-2 text-slate-400">
                    Generate a one-page PDF summary of your portfolio, net worth,
                    allocation and milestones.
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
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

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
}

export default App;
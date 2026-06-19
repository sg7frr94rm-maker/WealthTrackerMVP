import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getPerformance = () =>
  axios.get(`${API_URL}/portfolio/performance`);

export const getTransactions = () =>
  axios.get(`${API_URL}/transactions`);

export const getTrend = () =>
  axios.get(`${API_URL}/portfolio/trend`);

export const getDividends = () =>
  axios.get(`${API_URL}/dividends`);

export const getStats = () =>
  axios.get(`${API_URL}/portfolio/stats`);

export const saveSnapshot = () =>
  axios.post(`${API_URL}/portfolio/snapshot`);

export const addTransaction = (payload) =>
  axios.post(`${API_URL}/transactions`, payload);

export const updateTransaction = (id, payload) =>
  axios.put(`${API_URL}/transactions/${id}`, payload);

export const deleteTransaction = (id) =>
  axios.delete(`${API_URL}/transactions/${id}`);

export const addDividend = (payload) =>
  axios.post(`${API_URL}/dividends`, payload);

export const deleteDividend = (id) =>
  axios.delete(`${API_URL}/dividends/${id}`);

export const getSettings = () =>
  axios.get(`${API_URL}/settings`);

export const updatePortfolioGoal = (goal) =>
  axios.put(`${API_URL}/settings/goal`, {
    portfolioGoal: goal,
  });

export const getNetWorthSettings = () =>
  axios.get(`${API_URL}/settings/networth`);

export const updateNetWorthSettings = (payload) =>
  axios.put(`${API_URL}/settings/networth`, payload);

export const getNetWorthHistory = () =>
  axios.get(`${API_URL}/networth/history`);

export const saveNetWorthSnapshot = (payload) =>
  axios.post(`${API_URL}/networth/snapshot`, payload);

export const getWatchlist = () =>
  axios.get(`${API_URL}/watchlist`);

export const addWatchlistItem = (symbol, targetPrice) =>
  axios.post(`${API_URL}/watchlist`, {
    symbol,
    targetPrice,
  });

export const deleteWatchlistItem = (id) =>
  axios.delete(`${API_URL}/watchlist/${id}`);  

export const getDividendCalendar = () =>
  axios.get(`${API_URL}/dividend-calendar`);

export const addDividendCalendarItem = (payload) =>
  axios.post(`${API_URL}/dividend-calendar`, payload);

export const deleteDividendCalendarItem = (id) =>
  axios.delete(`${API_URL}/dividend-calendar/${id}`);

export const downloadWealthReport = () =>
  window.open(`${API_URL}/report/wealth`, "_blank");

export const getTargetAllocations = () =>
  axios.get(`${API_URL}/target-allocations`);

export const saveTargetAllocations = (targets) =>
  axios.put(`${API_URL}/target-allocations`, {
    targets,
  });

export const backupDatabase = async () => {
  const response = await fetch(`${API_URL}/api/backup-db`);

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `etf-backup-${new Date()
    .toISOString()
    .split("T")[0]}.db`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};

export const generateAiPortfolioInsights = (payload) =>
  axios.post(`${API_URL}/portfolio/ai-insights`, payload);

export const getMarketNews = () =>
  axios.get(`${API_URL}/news`);

export const getOpportunities = () =>
  axios.get(`${API_URL}/opportunities`);
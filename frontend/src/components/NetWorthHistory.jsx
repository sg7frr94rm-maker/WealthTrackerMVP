import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  getNetWorthHistory,
  saveNetWorthSnapshot,
} from "../api/portfolioApi";

function NetWorthHistory({ netWorth, totalAssets, totalLiabilities }) {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");

  const loadHistory = async () => {
    const res = await getNetWorthHistory();
    setHistory(res.data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSaveSnapshot = async () => {
    await saveNetWorthSnapshot({
      netWorth,
      totalAssets,
      totalLiabilities,
    });

    setStatus("Saved");
    await loadHistory();

    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold">Net Worth History</h3>
          <p className="mt-1 text-sm text-slate-400">
            Save snapshots to track your net worth growth over time.
          </p>
        </div>

        <button
          onClick={handleSaveSnapshot}
          className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold hover:bg-emerald-500"
        >
          {status || "Save Snapshot"}
        </button>
      </div>

      {history.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">
          No net worth snapshots saved yet.
        </div>
      ) : history.length < 2 ? (
        <div className="flex h-[320px] flex-col items-center justify-center text-center text-slate-400">
          <p className="text-lg font-semibold text-white">
            Snapshot saved successfully.
          </p>

          <p className="mt-2 text-sm">
            Save snapshots on multiple days to see your net worth trend chart.
          </p>
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                tickFormatter={(value) =>
                  `$${Number(value).toLocaleString()}`
                }
              />

              <Tooltip
                formatter={(value) =>
                  `$${Number(value).toLocaleString()}`
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="netWorth"
                name="Net Worth"
                stroke="#10b981"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="totalAssets"
                name="Total Assets"
                stroke="#3b82f6"
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="totalLiabilities"
                name="Liabilities"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default NetWorthHistory;
import { useEffect, useState } from "react";
import {
  getWatchlist,
  addWatchlistItem,
  deleteWatchlistItem,
} from "../api/portfolioApi";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  const loadWatchlist = async () => {
    const res = await getWatchlist();
    setWatchlist(res.data);
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAdd = async () => {
    if (!symbol.trim()) return;

    await addWatchlistItem(symbol, Number(targetPrice || 0));

    setSymbol("");
    setTargetPrice("");
    loadWatchlist();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this asset from watchlist?")) return;

    await deleteWatchlistItem(id);
    loadWatchlist();
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-5 text-xl font-bold">Asset Watchlist</h2>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px_90px]">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol e.g. VWRA"
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <input
          type="number"
          step="0.01"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Target price"
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
        />

        <button
          onClick={handleAdd}
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-3 text-left">Asset</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Distance</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {watchlist.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  No assets in watchlist yet.
                </td>
              </tr>
            )}
            
            {watchlist.map((item) => (
              <tr key={item.id} className="border-b border-slate-800">
                <td className="p-3">
                  <div className="font-semibold text-white">
                    {item.symbol}
                  </div>

                  <div className="mt-1 max-w-[380px] truncate text-sm text-slate-400">
                    {item.name}
                  </div>
                </td>

                <td className="p-3 font-semibold">
                  ${Number(item.currentPrice || 0).toFixed(2)}
                </td>

                <td className="p-3">
                  {item.targetPrice > 0
                    ? `$${Number(item.targetPrice).toFixed(2)}`
                    : "-"}
                </td>

                <td
                  className={`p-3 font-semibold ${
                    item.status === "Buy Zone"
                      ? "text-emerald-400"
                      : item.status === "Wait"
                      ? "text-yellow-400"
                      : "text-slate-400"
                  }`}
                >
                  {item.targetPrice > 0
                    ? `${item.distanceToTarget}%`
                    : "-"}
                </td>

                <td className="p-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.status === "Buy Zone"
                        ? "bg-emerald-900 text-emerald-300"
                        : item.status === "Wait"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded bg-red-600 px-3 py-1 font-semibold hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Watchlist;
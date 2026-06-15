import { useEffect, useState } from "react";
import {
  getDividendCalendar,
  addDividendCalendarItem,
  deleteDividendCalendarItem,
} from "../api/portfolioApi";

function DividendCalendar() {
  const [items, setItems] = useState([]);
  const totalUpcoming = items.reduce(
  (sum, item) => sum + Number(item.expectedAmount || 0),
  0
);

const next30Days = items
  .filter((item) => {
    const today = new Date();
    const target = new Date(item.expectedDate);

    const diffDays =
      (target - today) / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 30;
  })
  .reduce(
    (sum, item) => sum + Number(item.expectedAmount || 0),
    0
  );

const next90Days = items
  .filter((item) => {
    const today = new Date();
    const target = new Date(item.expectedDate);

    const diffDays =
      (target - today) / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 90;
  })
  .reduce(
    (sum, item) => sum + Number(item.expectedAmount || 0),
    0
  );
  const [form, setForm] = useState({
    symbol: "",
    expectedAmount: "",
    expectedDate: "",
    notes: "",
  });

  const loadCalendar = async () => {
    const res = await getDividendCalendar();
    setItems(res.data);
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    await addDividendCalendarItem({
      symbol: form.symbol,
      expectedAmount: Number(form.expectedAmount),
      expectedDate: form.expectedDate,
      notes: form.notes,
    });

    setForm({
      symbol: "",
      expectedAmount: "",
      expectedDate: "",
      notes: "",
    });

    loadCalendar();
  };

  const handleDelete = async (id) => {
    await deleteDividendCalendarItem(id);
    loadCalendar();
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-5 text-xl font-bold">Dividend Calendar</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
    <p className="text-sm text-slate-400">
      Total Upcoming Dividends
    </p>

    <p className="mt-2 text-2xl font-bold text-emerald-400">
      ${totalUpcoming.toFixed(2)}
    </p>
  </div>

  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
    <p className="text-sm text-slate-400">
      Next 30 Days
    </p>

    <p className="mt-2 text-2xl font-bold text-emerald-400">
      ${next30Days.toFixed(2)}
    </p>
  </div>

  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
    <p className="text-sm text-slate-400">
      Upcoming Events
    </p>

    <p className="mt-2 text-2xl font-bold text-white">
      {items.length}
    </p>
  </div>
</div>

      <form onSubmit={handleAdd} className="mb-6 grid gap-3 md:grid-cols-5">
        <input
          name="symbol"
          value={form.symbol}
          onChange={handleChange}
          placeholder="Symbol"
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
        />

        <input
          name="expectedAmount"
          type="number"
          step="0.01"
          value={form.expectedAmount}
          onChange={handleChange}
          placeholder="Amount"
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
        />

        <input
          name="expectedDate"
          type="date"
          value={form.expectedDate}
          onChange={handleChange}
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
        />

        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
        />

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Add
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-3 text-left">Symbol</th>
              <th className="p-3 text-left">Expected Date</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-800">
                <td className="p-3 font-semibold">{item.symbol}</td>
                <td className="p-3">{item.expectedDate}</td>
                <td className="p-3 font-semibold text-emerald-400">
                  ${Number(item.expectedAmount).toFixed(2)}
                </td>
                <td className="p-3 text-slate-400">{item.notes || "-"}</td>
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

            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  No upcoming dividend events added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DividendCalendar;
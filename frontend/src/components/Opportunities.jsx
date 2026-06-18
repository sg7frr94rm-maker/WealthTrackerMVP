import { useEffect, useState } from "react";
import { getOpportunities } from "../api/portfolioApi";

export default function Opportunities() {
 const [opportunities, setOpportunities] = useState([]);
 const [error, setError] = useState("");

useEffect(() => {
  getOpportunities()
    .then((res) => {
      setOpportunities(Array.isArray(res.data) ? res.data : []);
    })
    .catch(console.error);
}, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Investment Opportunities
      </h2>

    <p className="text-slate-400">
        Potential holdings based on diversification,
        dividend potential and market opportunities.
    </p>

      {opportunities.map((item) => (
        <div
          key={item.ticker}
          className="bg-slate-900 rounded-xl border border-slate-700 p-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {item.ticker}
            </h3>

            <span className="text-green-400 font-semibold">
              Score {item.score}/10
            </span>
          </div>

          <div className="mt-2 text-slate-300">
            {item.reason}
          </div>

          <div className="mt-3 flex gap-4 text-sm text-slate-400">
            <span>Role: {item.role}</span>
            <span>Risk: {item.risk}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
function MetricCard({ title, value, positive }) {
  const isColored = positive !== undefined;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <p
        className={`mt-3 text-2xl font-bold ${
          isColored
            ? positive
              ? "text-emerald-400"
              : "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default MetricCard;
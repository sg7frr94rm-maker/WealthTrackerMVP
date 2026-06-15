function InsightCard({ label, value, positive }) {
  const hasColor = positive !== undefined;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{label}</p>

      <p
        className={`mt-2 text-xl font-bold ${
          hasColor
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

export default InsightCard;
function HealthBar({ label, score }) {
  const scoreColor =
    score >= 75
      ? "bg-emerald-500"
      : score >= 55
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{score}/100</span>
      </div>

      <div className="h-3 w-full rounded-full bg-slate-800">
        <div
          className={`h-3 rounded-full ${scoreColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default HealthBar;
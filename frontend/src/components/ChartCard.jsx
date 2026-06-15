function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-center text-xl font-bold">{title}</h2>
      <div className="flex justify-center">{children}</div>
    </div>
  );
}

export default ChartCard;
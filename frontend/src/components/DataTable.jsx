export function Th({ children }) {
  return (
    <th className="px-4 py-3 text-sm font-semibold text-slate-300">
      {children}
    </th>
  );
}

export function Td({ children, positive }) {
  const isColored = positive !== undefined;

  return (
    <td
      className={`px-4 py-3 text-sm ${
        isColored
          ? positive
            ? "font-bold text-emerald-400"
            : "font-bold text-red-400"
          : "text-slate-300"
      }`}
    >
      {children}
    </td>
  );
}

function DataTable({ title, children }) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-center">{children}</table>
      </div>
    </section>
  );
}

export default DataTable;
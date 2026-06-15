function Input(props) {
  return (
    <input
      {...props}
      required
      className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 outline-none focus:border-emerald-500"
    />
  );
}

export default Input;
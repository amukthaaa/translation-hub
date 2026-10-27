export default function BarRow({ label, value, max, formatValue = (v) => v, barClassName = "bg-copeland-blue" }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <div className="flex-1 bg-slate-100 rounded h-5 relative overflow-hidden">
        <div className={`h-full rounded ${barClassName}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right text-slate-700 font-medium">{formatValue(value)}</span>
    </div>
  );
}

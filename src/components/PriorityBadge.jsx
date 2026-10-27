const STYLES = {
  High: "bg-red-100 text-red-700 border-red-300",
  Medium: "bg-amber-100 text-amber-800 border-amber-300",
  Low: "bg-slate-100 text-slate-600 border-slate-300",
};

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        STYLES[priority] || "bg-slate-100 text-slate-600 border-slate-300"
      }`}
    >
      {priority}
    </span>
  );
}

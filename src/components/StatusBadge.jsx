const STYLES = {
  Submitted: "bg-slate-100 text-slate-700 border-slate-300",
  "Not Started": "bg-slate-100 text-slate-700 border-slate-300",
  "In Translation": "bg-blue-100 text-blue-800 border-blue-300",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
  "In Review": "bg-amber-100 text-amber-800 border-amber-300",
  "Submitted for Review": "bg-amber-100 text-amber-800 border-amber-300",
  "Changes Requested": "bg-red-100 text-red-700 border-red-300",
  Published: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        STYLES[status] || "bg-slate-100 text-slate-700 border-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

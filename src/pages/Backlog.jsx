import backlog from "../data/backlog.json";

const PRIORITY_STYLES = {
  P0: "bg-red-100 text-red-700 border-red-300",
  P1: "bg-blue-100 text-blue-700 border-blue-300",
  P2: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function Backlog() {
  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">Backlog</h2>
      <p className="text-sm text-slate-500 mb-6">Prioritized user stories driving this prototype, with their success metric.</p>

      <div className="space-y-4">
        {backlog.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-5 flex gap-4">
            <span
              className={`shrink-0 h-fit inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                PRIORITY_STYLES[item.priority]
              }`}
            >
              {item.priority}
            </span>
            <div>
              <p className="text-slate-800">{item.story}</p>
              <p className="text-xs text-slate-400 mt-2">
                <span className="font-medium text-slate-500">Success metric:</span> {item.successMetric}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

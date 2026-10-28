import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import MetricCard from "../components/MetricCard";
import languages from "../data/languages.json";
import { deriveOverallStatus } from "../utils/workflow";
import { overallAvgTurnaroundDays, monthlySpend } from "../utils/metrics";
import { AlertTriangle, ArrowRight } from "lucide-react";

const TODAY = new Date();
const CURRENT_MONTH = TODAY.toISOString().slice(0, 7);

const ROLE_DOT = {
  Reviewer: "bg-red-400",
  Translator: "bg-blue-400",
  Admin: "bg-amber-400",
};

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function AdminDashboard() {
  const { requests } = useRequests();

  const withStatus = useMemo(
    () => requests.map((r) => ({ ...r, overallStatus: deriveOverallStatus(r.languages) })),
    [requests]
  );
  const openCount = withStatus.filter((r) => r.overallStatus !== "Published").length;
  const allOverdue = useMemo(
    () =>
      withStatus
        .filter((r) => r.overallStatus !== "Published" && new Date(r.dueDate) < TODAY)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [withStatus]
  );
  const overdueRequests = allOverdue.slice(0, 5);
  const avgTurnaround = overallAvgTurnaroundDays(requests);
  const spend = monthlySpend(requests, CURRENT_MONTH);

  const recentActivity = useMemo(() => {
    const items = [];
    for (const r of requests) {
      for (const l of r.languages) {
        for (const c of l.comments || []) {
          items.push({ request: r, lang: l, comment: c });
        }
      }
    }
    return items.sort((a, b) => (a.comment.createdAt < b.comment.createdAt ? 1 : -1)).slice(0, 5);
  }, [requests]);

  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">Dashboard</h2>
      <p className="text-sm text-slate-500 mb-6">Snapshot of open work and operational health.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Open requests" value={openCount} />
        <MetricCard label="Overdue requests" value={allOverdue.length} />
        <MetricCard label="Average turnaround" value={avgTurnaround !== null ? `${avgTurnaround}d` : "—"} />
        <MetricCard label="Spend this month" value={`$${spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-700">Overdue requests</h3>
            <Link to="/all-requests" className="text-xs text-copeland-blue hover:underline inline-flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {overdueRequests.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing overdue right now.</p>
          ) : (
            <div className="space-y-2">
              {overdueRequests.map((r) => (
                <Link
                  key={r.id}
                  to={`/request/${r.id}`}
                  className="flex items-center justify-between gap-3 text-sm border border-slate-100 rounded-md px-3 py-2 hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-slate-800 truncate block">{r.title}</span>
                    <span className="text-xs text-slate-400">
                      {r.id} · Owner {r.owner}
                    </span>
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" /> Due {r.dueDate}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Recent activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">No comments or updates yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(({ request, lang, comment }) => (
                <Link
                  key={comment.id}
                  to={`/request/${request.id}`}
                  className="flex items-start gap-2.5 text-sm hover:bg-slate-50 rounded-md -mx-1 px-1 py-1"
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${ROLE_DOT[comment.role] || "bg-slate-300"}`} />
                  <span className="min-w-0">
                    <span className="text-slate-700">
                      <span className="font-medium">{comment.role === "Admin" ? "Admin" : comment.author}</span> ·{" "}
                      {request.title} ({languageName(lang.code)})
                    </span>
                    <span className="block text-xs text-slate-400 truncate">{comment.text}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{comment.createdAt}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useRequests } from "../context/RequestsContext";
import MetricCard from "../components/MetricCard";
import { deriveOverallStatus } from "../utils/workflow";
import { overallAvgTurnaroundDays, monthlySpend } from "../utils/metrics";

const TODAY = new Date();
const CURRENT_MONTH = TODAY.toISOString().slice(0, 7);

export default function AdminDashboard() {
  const { requests } = useRequests();

  const withStatus = useMemo(
    () => requests.map((r) => ({ ...r, overallStatus: deriveOverallStatus(r.languages) })),
    [requests]
  );
  const openCount = withStatus.filter((r) => r.overallStatus !== "Published").length;
  const overdueCount = withStatus.filter(
    (r) => r.overallStatus !== "Published" && new Date(r.dueDate) < TODAY
  ).length;
  const avgTurnaround = overallAvgTurnaroundDays(requests);
  const spend = monthlySpend(requests, CURRENT_MONTH);

  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">Dashboard</h2>
      <p className="text-sm text-slate-500 mb-6">Snapshot of open work and operational health.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Open requests" value={openCount} />
        <MetricCard label="Overdue requests" value={overdueCount} />
        <MetricCard label="Average turnaround" value={avgTurnaround !== null ? `${avgTurnaround}d` : "—"} />
        <MetricCard label="Spend this month" value={`$${spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
      </div>
    </div>
  );
}

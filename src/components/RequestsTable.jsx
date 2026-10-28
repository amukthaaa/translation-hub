import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Select from "./Select";
import languages from "../data/languages.json";
import sources from "../data/sources.json";
import { deriveOverallStatus } from "../utils/workflow";
import { AlertTriangle } from "lucide-react";

const STATUSES = ["Submitted", "In Translation", "In Review", "Approved", "Published"];
const TODAY = new Date();

function isOverdue(request, overallStatus) {
  if (overallStatus === "Published") return false;
  return new Date(request.dueDate) < TODAY;
}

const currency = (n) => `$${n.toFixed(2)}`;

export default function RequestsTable({
  requests,
  title,
  showOwnerColumn = true,
  showCreatedColumn = false,
  showNewRequestButton = false,
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const withStatus = useMemo(
    () => requests.map((r) => ({ ...r, overallStatus: deriveOverallStatus(r.languages) })),
    [requests]
  );

  const filtered = useMemo(() => {
    return withStatus.filter((r) => {
      const statusOk = statusFilter === "All" || r.overallStatus === statusFilter;
      const langOk = languageFilter === "All" || r.languages.some((l) => l.code === languageFilter);
      const sourceOk = sourceFilter === "All" || r.source === sourceFilter;
      return statusOk && langOk && sourceOk;
    });
  }, [withStatus, statusFilter, languageFilter, sourceFilter]);

  const overdueCount = withStatus.filter((r) => isOverdue(r, r.overallStatus)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{requests.length} total requests</span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
                <AlertTriangle className="h-3.5 w-3.5" /> {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
        {showNewRequestButton && (
          <Link
            to="/new-request"
            className="bg-copeland-blue text-white px-4 py-2 text-sm font-medium hover:bg-copeland-navy transition-colors"
          >
            + New Request
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
        >
          <option value="All">All languages</option>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </Select>
        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
        >
          <option value="All">All sources</option>
          {sources.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Languages</th>
              {showOwnerColumn && <th className="px-4 py-3 font-medium">Owner</th>}
              {showCreatedColumn && <th className="px-4 py-3 font-medium">Created</th>}
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Est. Cost</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const overdue = isOverdue(r, r.overallStatus);
              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <Link to={`/request/${r.id}`} className="font-medium text-copeland-blue hover:underline">
                      {r.title}
                    </Link>
                    <div className="text-xs text-slate-400">{r.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.source}</td>
                  <td className="px-4 py-3 text-slate-600">{r.languages.map((l) => l.code).join(", ")}</td>
                  {showOwnerColumn && <td className="px-4 py-3 text-slate-600">{r.owner}</td>}
                  {showCreatedColumn && <td className="px-4 py-3 text-slate-600">{r.createdAt}</td>}
                  <td className={`px-4 py-3 ${overdue ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                    {r.dueDate}
                    {overdue && " (overdue)"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{currency(r.estimatedCost ?? 0)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.overallStatus} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6 + (showOwnerColumn ? 1 : 0) + (showCreatedColumn ? 1 : 0)}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No requests match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

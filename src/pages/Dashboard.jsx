import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import StatusBadge from "../components/StatusBadge";
import languages from "../data/languages.json";
import { AlertTriangle } from "lucide-react";

const STATUSES = ["Submitted", "In Translation", "In Review", "Published"];
const TODAY = new Date("2026-10-24");

function isOverdue(request) {
  if (request.status === "Published") return false;
  return new Date(request.dueDate) < TODAY;
}

export default function Dashboard() {
  const { requests } = useRequests();
  const [statusFilter, setStatusFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const statusOk = statusFilter === "All" || r.status === statusFilter;
      const langOk = languageFilter === "All" || r.languages.some((l) => l.code === languageFilter);
      return statusOk && langOk;
    });
  }, [requests, statusFilter, languageFilter]);

  const overdueCount = requests.filter(isOverdue).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Status Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            {requests.length} total requests
            {overdueCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
        <Link
          to="/new"
          className="bg-copeland-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-copeland-navy transition-colors"
        >
          + New Request
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="All">All languages</option>
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Languages</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const overdue = isOverdue(r);
              return (
                <tr
                  key={r.id}
                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer ${
                    overdue ? "bg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link to={`/request/${r.id}`} className="font-medium text-copeland-blue hover:underline">
                      {r.title}
                    </Link>
                    <div className="text-xs text-slate-400">{r.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.languages.map((l) => l.code).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.owner}</td>
                  <td className={`px-4 py-3 ${overdue ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                    {r.dueDate}
                    {overdue && " (overdue)"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.priority}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
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

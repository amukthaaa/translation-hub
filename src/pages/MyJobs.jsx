import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Select from "../components/Select";
import { translatorStatusLabel } from "../utils/workflow";
import languages from "../data/languages.json";
import { BellRing } from "lucide-react";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

const SORT_OPTIONS = [
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
];

const STATUS_FILTERS = ["Submitted", "In Translation", "In Review", "Changes Requested", "Published"];
const PRIORITY_FILTERS = ["High", "Medium", "Low"];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const COMPARATORS = {
  dueDate: (a, b) => new Date(a.request.dueDate) - new Date(b.request.dueDate),
  priority: (a, b) => (PRIORITY_ORDER[a.request.priority] ?? 99) - (PRIORITY_ORDER[b.request.priority] ?? 99),
};

export default function MyJobs() {
  const { requests } = useRequests();
  const { persona } = useAuth();
  const [sortBy, setSortBy] = useState("dueDate");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const jobs = useMemo(() => {
    const items = [];
    for (const r of requests) {
      for (const l of r.languages) {
        if (l.translator === persona.name) {
          items.push({ request: r, lang: l });
        }
      }
    }
    const filtered = items.filter(({ request, lang }) => {
      const statusOk = statusFilter === "All" || lang.status === statusFilter;
      const priorityOk = priorityFilter === "All" || request.priority === priorityFilter;
      return statusOk && priorityOk;
    });
    const compare = COMPARATORS[sortBy];
    const isNew = ({ lang }) => lang.status === "Submitted" && !lang.viewed;
    return filtered.sort((a, b) => {
      if (!!a.lang.needsAttention !== !!b.lang.needsAttention) return a.lang.needsAttention ? -1 : 1;
      if (isNew(a) !== isNew(b)) return isNew(a) ? -1 : 1;
      return compare(a, b);
    });
  }, [requests, persona, sortBy, statusFilter, priorityFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-slate-900 mb-1">My Jobs</h2>
          <p className="text-sm text-slate-500">Assigned translation jobs into {languageName(persona.language)}.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Sort by</label>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
        >
          <option value="All">All statuses</option>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {translatorStatusLabel(s)}
            </option>
          ))}
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
        >
          <option value="All">All priorities</option>
          {PRIORITY_FILTERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Language pair</th>
              <th className="px-4 py-3 font-medium">Word count</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(({ request, lang }) => (
              <tr key={`${request.id}-${lang.code}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link to={`/job/${request.id}/${lang.code}`} className="font-medium text-copeland-blue hover:underline">
                      {request.title}
                    </Link>
                    {lang.needsAttention && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                        <BellRing className="h-3 w-3" /> Updated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{request.id}</span>
                    {lang.status === "Submitted" && !lang.viewed && (
                      <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">English → {languageName(lang.code)}</td>
                <td className="px-4 py-3 text-slate-600">{request.wordCount}</td>
                <td className="px-4 py-3 text-slate-600">{request.dueDate}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={request.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={translatorStatusLabel(lang.status)} />
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No jobs match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

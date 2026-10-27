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
  { value: "wordCount", label: "Word count" },
  { value: "status", label: "Status" },
];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER = {
  "Changes Requested": 0,
  Submitted: 1,
  "In Translation": 2,
  "In Review": 3,
  Published: 4,
};

const COMPARATORS = {
  dueDate: (a, b) => new Date(a.request.dueDate) - new Date(b.request.dueDate),
  priority: (a, b) => (PRIORITY_ORDER[a.request.priority] ?? 99) - (PRIORITY_ORDER[b.request.priority] ?? 99),
  wordCount: (a, b) => (a.request.wordCount ?? 0) - (b.request.wordCount ?? 0),
  status: (a, b) => (STATUS_ORDER[a.lang.status] ?? 99) - (STATUS_ORDER[b.lang.status] ?? 99),
};

export default function MyJobs() {
  const { requests } = useRequests();
  const { persona } = useAuth();
  const [sortBy, setSortBy] = useState("dueDate");

  const jobs = useMemo(() => {
    const items = [];
    for (const r of requests) {
      for (const l of r.languages) {
        if (l.translator === persona.name) {
          items.push({ request: r, lang: l });
        }
      }
    }
    const compare = COMPARATORS[sortBy];
    return items.sort((a, b) => {
      if (!!a.lang.needsAttention !== !!b.lang.needsAttention) return a.lang.needsAttention ? -1 : 1;
      return compare(a, b);
    });
  }, [requests, persona, sortBy]);

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
                  <div className="text-xs text-slate-400">{request.id}</div>
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
                  No jobs assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

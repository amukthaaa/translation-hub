import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import { translatorStatusLabel } from "../utils/workflow";
import languages from "../data/languages.json";
import { BellRing } from "lucide-react";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function MyJobs() {
  const { requests } = useRequests();
  const { persona } = useAuth();

  const jobs = useMemo(() => {
    const items = [];
    for (const r of requests) {
      for (const l of r.languages) {
        if (l.translator === persona.name) {
          items.push({ request: r, lang: l });
        }
      }
    }
    return items.sort((a, b) => {
      if (!!a.lang.needsAttention !== !!b.lang.needsAttention) return a.lang.needsAttention ? -1 : 1;
      const aDone = a.lang.status === "Published";
      const bDone = b.lang.status === "Published";
      if (aDone !== bDone) return aDone ? 1 : -1;
      return new Date(a.request.dueDate) - new Date(b.request.dueDate);
    });
  }, [requests, persona]);

  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">My Jobs</h2>
      <p className="text-sm text-slate-500 mb-6">Assigned translation jobs into {languageName(persona.language)}.</p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Language pair</th>
              <th className="px-4 py-3 font-medium">Word count</th>
              <th className="px-4 py-3 font-medium">Due date</th>
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
                  <StatusBadge status={translatorStatusLabel(lang.status)} />
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
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

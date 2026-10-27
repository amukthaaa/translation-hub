import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import languages from "../data/languages.json";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;
const TODAY = new Date();

export default function ReviewQueue() {
  const { requests } = useRequests();
  const { persona } = useAuth();

  const queue = useMemo(() => {
    const items = [];
    for (const r of requests) {
      for (const l of r.languages) {
        if (l.reviewer === persona.name && l.status === "In Review") {
          items.push({ request: r, lang: l, overdue: new Date(r.dueDate) < TODAY });
        }
      }
    }
    return items.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return new Date(a.request.dueDate) - new Date(b.request.dueDate);
    });
  }, [requests, persona]);

  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">Review Queue</h2>
      <p className="text-sm text-slate-500 mb-6">
        Requests waiting for your review in {languageName(persona.language)} ({persona.region}).
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {queue.map(({ request, lang, overdue }) => (
              <tr key={`${request.id}-${lang.code}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/review/${request.id}/${lang.code}`} className="font-medium text-copeland-blue hover:underline">
                    {request.title}
                  </Link>
                  <div className="text-xs text-slate-400">{request.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{request.owner}</td>
                <td className={`px-4 py-3 ${overdue ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                  {request.dueDate}
                  {overdue && " (overdue)"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lang.status} />
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Nothing waiting for review right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

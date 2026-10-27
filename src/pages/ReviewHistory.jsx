import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import languages from "../data/languages.json";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function ReviewHistory() {
  const { requests } = useRequests();
  const { persona } = useAuth();

  const history = useMemo(() => {
    const items = [];
    for (const r of requests) {
      for (const l of r.languages) {
        if (l.reviewer === persona.name && (l.status === "Approved" || l.status === "Published")) {
          items.push({ request: r, lang: l });
        }
      }
    }
    return items.sort((a, b) => {
      const aDate = a.lang.completedAt || "";
      const bDate = b.lang.completedAt || "";
      return bDate.localeCompare(aDate);
    });
  }, [requests, persona]);

  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">History</h2>
      <p className="text-sm text-slate-500 mb-6">
        Requests you've approved in {languageName(persona.language)} ({persona.region}).
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Translator</th>
              <th className="px-4 py-3 font-medium">Approved on</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(({ request, lang }) => (
              <tr key={`${request.id}-${lang.code}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/review/${request.id}/${lang.code}`} className="font-medium text-copeland-blue hover:underline">
                    {request.title}
                  </Link>
                  <div className="text-xs text-slate-400">{request.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{request.owner}</td>
                <td className="px-4 py-3 text-slate-600">{lang.translator || "Unassigned"}</td>
                <td className="px-4 py-3 text-slate-600">{lang.completedAt || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={lang.status} />
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  Nothing approved yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

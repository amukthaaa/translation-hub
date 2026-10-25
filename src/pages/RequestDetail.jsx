import { Link, useParams } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import languages from "../data/languages.json";
import glossaryData from "../data/glossary.json";
import { findGlossaryMatches } from "../utils/glossary";
import HighlightedText from "../components/HighlightedText";
import ScreenshotPlaceholder from "../components/ScreenshotPlaceholder";
import StatusBadge from "../components/StatusBadge";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function RequestDetail() {
  const { id } = useParams();
  const { requests } = useRequests();
  const request = requests.find((r) => r.id === id);

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Request {id} was not found.</p>
        <Link to="/" className="text-copeland-blue hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const targetCodes = request.languages.map((l) => l.code);
  const matches = findGlossaryMatches(request.sourceText, glossaryData);
  const distinctTerms = Array.from(new Map(matches.map((m) => [m.term, m])).values());
  const missingAny = distinctTerms.filter((m) => targetCodes.some((code) => !m.translations[code]));

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{request.title}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {request.id} · Owner {request.owner} · Due {request.dueDate} · Priority {request.priority}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Source text</h3>
            <HighlightedText text={request.sourceText} glossary={glossaryData} targetLanguageCodes={targetCodes} />
          </div>

          {distinctTerms.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Glossary terms detected</h3>
              <div className="space-y-3">
                {distinctTerms.map((m) => (
                  <div key={m.term} className="border border-slate-100 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800 capitalize">{m.term}</span>
                      <span className="text-xs text-slate-400">{m.category}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {targetCodes.map((code) => {
                        const translation = m.translations[code];
                        return (
                          <div
                            key={code}
                            className={`text-xs rounded px-2 py-1 flex items-center justify-between gap-2 ${
                              translation ? "bg-slate-50 text-slate-600" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span className="text-slate-400">{code}</span>
                            {translation ? (
                              <span className="font-medium">{translation}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <AlertTriangle className="h-3 w-3" /> none
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {missingAny.length > 0 && (
                <p className="text-xs text-amber-600 mt-3">
                  {missingAny.length} term(s) are missing an approved translation for at least one target language.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {request.screenshot && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Context screenshot</h3>
              <ScreenshotPlaceholder title={request.title} />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Per-language status</h3>
            <div className="space-y-3">
              {request.languages.map((l) => (
                <div key={l.code} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{languageName(l.code)}</p>
                    <p className="text-xs text-slate-400">{l.reviewer || "Unassigned"}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

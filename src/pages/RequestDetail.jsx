import { Link, useParams } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useGlossary } from "../context/GlossaryContext";
import { useAuth } from "../context/AuthContext";
import languages from "../data/languages.json";
import { findGlossaryMatches } from "../utils/glossary";
import { deriveOverallStatus, canEditRequest } from "../utils/workflow";
import HighlightedText from "../components/HighlightedText";
import ScreenshotPlaceholder from "../components/ScreenshotPlaceholder";
import StatusBadge from "../components/StatusBadge";
import CommentThread from "../components/CommentThread";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function RequestDetail() {
  const { id } = useParams();
  const { requests } = useRequests();
  const { terms: glossaryData } = useGlossary();
  const { role } = useAuth();
  const request = requests.find((r) => r.id === id);
  const backTo = role === "Admin" ? "/all-requests" : "/my-requests";
  const backLabel = role === "Admin" ? "Back to all requests" : "Back to my requests";

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Request {id} was not found.</p>
        <Link to={backTo} className="text-copeland-blue hover:underline text-sm">
          {backLabel}
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
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-slate-900">{request.title}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {request.id} · Owner {request.owner} · Due {request.dueDate} · Priority {request.priority}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Source {request.source} · Order ref {request.orderRef} · Est. cost ${request.estimatedCost?.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {role === "Content Owner" && canEditRequest(request) && (
            <Link
              to={`/request/${request.id}/edit`}
              className="border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Edit
            </Link>
          )}
          <StatusBadge status={deriveOverallStatus(request.languages)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Source text</h3>
            <HighlightedText text={request.sourceText} glossary={glossaryData} targetLanguageCodes={targetCodes} />
          </div>

          {distinctTerms.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Glossary terms detected</h3>
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
              <h3 className="text-sm font-medium text-slate-700 mb-2">Context screenshot</h3>
              <ScreenshotPlaceholder title={request.title} />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Per-language status</h3>
            <div className="space-y-3">
              {request.languages.map((l) => (
                <div key={l.code} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{languageName(l.code)}</p>
                      <p className="text-xs text-slate-400">Reviewer: {l.reviewer || "Unassigned"}</p>
                      <p className="text-xs text-slate-400">Translator: {l.translator || "Unassigned"}</p>
                      <p className="text-xs text-slate-400">${l.cost?.toFixed(2) ?? "0.00"}</p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                  {l.comments?.length > 0 && (
                    <div className="mt-2">
                      <CommentThread comments={l.comments} viewerRole={role} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

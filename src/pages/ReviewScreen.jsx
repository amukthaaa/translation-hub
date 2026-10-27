import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useGlossary } from "../context/GlossaryContext";
import { useAuth } from "../context/AuthContext";
import HighlightedText from "../components/HighlightedText";
import ScreenshotPlaceholder from "../components/ScreenshotPlaceholder";
import StatusBadge from "../components/StatusBadge";
import CommentThread from "../components/CommentThread";
import { findTranslationMismatches } from "../utils/workflow";
import languages from "../data/languages.json";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function ReviewScreen() {
  const { id, lang } = useParams();
  const { requests, approveLanguage, requestChanges } = useRequests();
  const { terms: glossary } = useGlossary();
  const { persona } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const request = requests.find((r) => r.id === id);
  const langEntry = request?.languages.find((l) => l.code === lang);

  if (!request || !langEntry) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Review item not found.</p>
        <Link to="/review-queue" className="text-copeland-blue hover:underline text-sm">
          Back to review queue
        </Link>
      </div>
    );
  }

  const mismatches = findTranslationMismatches(request.sourceText, langEntry.translatedText, glossary, lang);

  const handleApprove = () => {
    approveLanguage(request.id, lang);
    navigate("/review-queue");
  };

  const handleRequestChanges = () => {
    if (!comment.trim()) return;
    requestChanges(request.id, lang, comment.trim(), persona.name);
    navigate("/review-queue");
  };

  return (
    <div>
      <Link to="/review-queue" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to review queue
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-slate-900">{request.title}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {request.id} · {languageName(lang)} · Translator {langEntry.translator || "Unassigned"}
          </p>
        </div>
        <StatusBadge status={langEntry.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Source text (English)</h3>
              <HighlightedText text={request.sourceText} glossary={glossary} targetLanguageCodes={[lang]} />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Translation ({languageName(lang)})</h3>
              {langEntry.translatedText ? (
                <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{langEntry.translatedText}</p>
              ) : (
                <p className="text-sm text-slate-400">No draft submitted yet.</p>
              )}
            </div>
          </div>

          {langEntry.comments?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Conversation</h3>
              <CommentThread comments={langEntry.comments} />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Glossary term check</h3>
            {mismatches.length === 0 ? (
              <p className="text-sm text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> All approved terms match the translation.
              </p>
            ) : (
              <div className="space-y-2">
                {mismatches.map((m) => (
                  <div
                    key={m.term}
                    className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-1.5 flex items-center gap-2"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      <span className="font-medium capitalize">{m.term}</span> — expected "{m.approved}", not found
                      in the translation.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {request.screenshot && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Context screenshot</h3>
              <ScreenshotPlaceholder title={request.title} />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Actions</h3>
            <button
              onClick={handleApprove}
              className="w-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              Approve
            </button>
            {!showCommentBox ? (
              <button
                onClick={() => setShowCommentBox(true)}
                className="w-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Request changes
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What needs to change?"
                  rows={3}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  onClick={handleRequestChanges}
                  disabled={!comment.trim()}
                  className="w-full bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:bg-slate-300"
                >
                  Send request for changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

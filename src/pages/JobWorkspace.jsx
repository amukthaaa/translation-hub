import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useGlossary } from "../context/GlossaryContext";
import { useAuth } from "../context/AuthContext";
import HighlightedText from "../components/HighlightedText";
import ScreenshotPlaceholder from "../components/ScreenshotPlaceholder";
import StatusBadge from "../components/StatusBadge";
import CommentThread from "../components/CommentThread";
import { findGlossaryMatches } from "../utils/glossary";
import { translatorStatusLabel } from "../utils/workflow";
import languages from "../data/languages.json";
import { ArrowLeft } from "lucide-react";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function JobWorkspace() {
  const { id, lang } = useParams();
  const { requests, saveDraft, submitForReview, replyToComment, acknowledgeUpdate } = useRequests();
  const { terms: glossary } = useGlossary();
  const { persona } = useAuth();
  const navigate = useNavigate();

  const request = requests.find((r) => r.id === id);
  const langEntry = request?.languages.find((l) => l.code === lang);
  const [text, setText] = useState(langEntry?.translatedText || "");
  const [reply, setReply] = useState("");

  useEffect(() => {
    setText(langEntry?.translatedText || "");
  }, [langEntry?.translatedText]);

  useEffect(() => {
    if (request && langEntry?.needsAttention) {
      acknowledgeUpdate(request.id, lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id, lang, langEntry?.needsAttention]);

  if (!request || !langEntry) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Job not found.</p>
        <Link to="/my-jobs" className="text-copeland-blue hover:underline text-sm">
          Back to my jobs
        </Link>
      </div>
    );
  }

  const matches = findGlossaryMatches(request.sourceText, glossary);
  const distinctTerms = Array.from(new Map(matches.map((m) => [m.term, m])).values()).filter(
    (m) => m.translations[lang]
  );

  const handleSaveDraft = () => {
    saveDraft(request.id, lang, text);
  };

  const handleSubmit = () => {
    submitForReview(request.id, lang, text);
    navigate("/my-jobs");
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    replyToComment(request.id, lang, reply.trim(), persona.name);
    setReply("");
  };

  return (
    <div>
      <Link to="/my-jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to my jobs
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-slate-900">{request.title}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {request.id} · English → {languageName(lang)} · Due {request.dueDate}
          </p>
        </div>
        <StatusBadge status={translatorStatusLabel(langEntry.status)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Source text (English)</h3>
            <HighlightedText text={request.sourceText} glossary={glossary} targetLanguageCodes={[lang]} />
            {distinctTerms.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {distinctTerms.map((m) => (
                  <div key={m.term} className="text-xs rounded px-2 py-1 bg-slate-50 flex items-center justify-between gap-2">
                    <span className="text-slate-400 capitalize">{m.term}</span>
                    <span className="font-medium">{m.translations[lang]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Your translation</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={`Translate into ${languageName(lang)}...`}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={handleSaveDraft}
                className="border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Save draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="bg-copeland-blue text-white px-4 py-2 text-sm font-medium hover:bg-copeland-navy disabled:bg-slate-300"
              >
                Submit for review
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {langEntry.comments?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Activity &amp; feedback</h3>
              <CommentThread comments={langEntry.comments} />
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  placeholder="Reply to the reviewer..."
                  className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="bg-copeland-blue text-white px-4 py-2 text-sm font-medium hover:bg-copeland-navy disabled:bg-slate-300"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {request.screenshot && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Context screenshot</h3>
              <ScreenshotPlaceholder title={request.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

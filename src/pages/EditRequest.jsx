import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import { useGlossary } from "../context/GlossaryContext";
import sources from "../data/sources.json";
import { glossaryCoverage } from "../utils/glossary";
import { canEditRequest } from "../utils/workflow";
import HighlightedText from "../components/HighlightedText";
import Select from "../components/Select";
import { ArrowLeft, ImagePlus, AlertTriangle, CheckCircle2, X } from "lucide-react";

const PRIORITIES = ["Low", "Medium", "High"];

export default function EditRequest() {
  const { id } = useParams();
  const { requests, updateRequest } = useRequests();
  const { terms: glossary } = useGlossary();
  const navigate = useNavigate();

  const request = requests.find((r) => r.id === id);

  const [title, setTitle] = useState(request?.title || "");
  const [sourceText, setSourceText] = useState(request?.sourceText || "");
  const [dueDate, setDueDate] = useState(request?.dueDate || "");
  const [priority, setPriority] = useState(request?.priority || "Medium");
  const [source, setSource] = useState(request?.source || sources[0].code);
  const [screenshotUrl, setScreenshotUrl] = useState(request?.screenshotUrl || null);
  const [screenshotName, setScreenshotName] = useState(request?.screenshotName || null);

  const targetCodes = useMemo(() => request?.languages.map((l) => l.code) || [], [request]);
  const coverage = useMemo(
    () => (sourceText.trim() ? glossaryCoverage(sourceText, glossary, targetCodes) : []),
    [sourceText, targetCodes, glossary]
  );

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Request {id} was not found.</p>
        <Link to="/my-requests" className="text-copeland-blue hover:underline text-sm">
          Back to my requests
        </Link>
      </div>
    );
  }

  if (!canEditRequest(request)) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-700 font-medium mb-1">This request can no longer be edited.</p>
        <p className="text-sm text-slate-500 mb-6">
          At least one language has moved to review or beyond, so the source content is locked to keep
          translator and reviewer work in sync.
        </p>
        <Link
          to={`/request/${request.id}`}
          className="inline-block bg-copeland-blue text-white px-4 py-2 text-sm font-medium hover:bg-copeland-navy"
        >
          Back to request
        </Link>
      </div>
    );
  }

  const canSubmit = title.trim() && sourceText.trim() && dueDate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    updateRequest(request.id, {
      title: title.trim(),
      sourceText: sourceText.trim(),
      dueDate,
      priority,
      source,
      screenshotUrl,
      screenshotName,
    });
    navigate(`/request/${request.id}`);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotUrl(URL.createObjectURL(file));
    setScreenshotName(file.name);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotUrl(null);
    setScreenshotName(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={`/request/${request.id}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to request
      </Link>

      <h2 className="text-2xl font-medium text-slate-900 mb-1">Edit Request</h2>
      <p className="text-sm text-slate-500 mb-6">
        {request.id} · editable until a translator submits a language for review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>

          {coverage.length > 0 && (
            <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
              <p className="text-xs font-medium text-slate-500 mb-2">Glossary preview</p>
              <HighlightedText text={sourceText} glossary={glossary} targetLanguageCodes={targetCodes} />
              <div className="mt-3 space-y-1">
                {coverage.map((c) => (
                  <div key={c.term} className="flex items-center gap-2 text-xs">
                    {c.missing.length > 0 ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span className="font-medium text-slate-700">{c.term}</span>
                    {c.missing.length > 0 ? (
                      <span className="text-amber-600">no approved translation for {c.missing.join(", ")}</span>
                    ) : (
                      <span className="text-slate-400">approved translation available</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content source</label>
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                wrapperClassName="w-full"
                className="w-full border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
              >
                {sources.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                wrapperClassName="w-full"
                className="w-full border border-slate-300 rounded-md pl-3 pr-9 py-2 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Context screenshot (optional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 w-fit">
                <ImagePlus className="h-4 w-4" />
                {screenshotName ? "Replace screenshot" : "Upload a screenshot"}
                <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
              </label>
              {screenshotName && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  {screenshotName}
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
            {screenshotUrl && (
              <img src={screenshotUrl} alt="Screenshot preview" className="mt-2 max-h-32 rounded-md border border-slate-200" />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to={`/request/${request.id}`}
            className="border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-copeland-blue text-white px-5 py-2.5 text-sm font-medium hover:bg-copeland-navy disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../context/RequestsContext";
import languages from "../data/languages.json";
import glossary from "../data/glossary.json";
import sources from "../data/sources.json";
import costs from "../data/costs.json";
import { glossaryCoverage } from "../utils/glossary";
import HighlightedText from "../components/HighlightedText";
import { UploadCloud, ImagePlus, AlertTriangle, CheckCircle2 } from "lucide-react";

const PRIORITIES = ["Low", "Medium", "High"];

export default function NewRequest() {
  const { addRequest } = useRequests();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [fileName, setFileName] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [source, setSource] = useState(sources[0].code);
  const [owner, setOwner] = useState("");
  const [screenshotAttached, setScreenshotAttached] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const toggleLanguage = (code) => {
    setSelectedLanguages((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const coverage = useMemo(
    () => (sourceText.trim() ? glossaryCoverage(sourceText, glossary, selectedLanguages) : []),
    [sourceText, selectedLanguages]
  );

  const rateByCode = useMemo(() => Object.fromEntries(costs.map((c) => [c.code, c.ratePerWord])), []);
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedCostPreview = selectedLanguages.reduce(
    (sum, code) => sum + wordCount * (rateByCode[code] ?? 0.15),
    0
  );

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.type.startsWith("text/")) {
      file.text().then((text) => setSourceText(text));
    }
  };

  const canSubmit = title.trim() && sourceText.trim() && selectedLanguages.length > 0 && dueDate && owner.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const id = addRequest({
      title: title.trim(),
      sourceText: sourceText.trim(),
      owner: owner.trim(),
      priority,
      dueDate,
      source,
      screenshot: screenshotAttached,
      languageCodes: selectedLanguages,
    });
    setSubmitted(id);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Request submitted</h2>
        <p className="text-sm text-slate-500 mb-6">
          {submitted} was created and is now in the Submitted queue.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/request/${submitted}`)}
            className="bg-copeland-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-copeland-navy"
          >
            View request
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-slate-300 px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">New Translation Request</h2>
      <p className="text-sm text-slate-500 mb-6">Should take under 2 minutes to fill out.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scroll Compressor Installation Manual — Rev C"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              placeholder="Paste the source text to translate..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-mono"
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-copeland-blue cursor-pointer hover:underline">
                <UploadCloud className="h-4 w-4" />
                Upload a file instead
                <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
              </label>
              {fileName && <span className="text-xs text-slate-400">{fileName}</span>}
            </div>
          </div>

          {coverage.length > 0 && (
            <div className="border border-slate-200 rounded-md p-3 bg-slate-50">
              <p className="text-xs font-medium text-slate-500 mb-2">Glossary preview</p>
              <HighlightedText text={sourceText} glossary={glossary} targetLanguageCodes={selectedLanguages} />
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
                      <span className="text-amber-600">
                        no approved translation for {c.missing.join(", ")}
                      </span>
                    ) : (
                      <span className="text-slate-400">approved translation available</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target languages</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {languages.map((l) => (
                <label
                  key={l.code}
                  className={`flex items-center gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer ${
                    selectedLanguages.includes(l.code)
                      ? "border-copeland-blue bg-blue-50 text-copeland-navy"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(l.code)}
                    onChange={() => toggleLanguage(l.code)}
                    className="accent-copeland-blue"
                  />
                  {l.name}
                </label>
              ))}
            </div>
            {selectedLanguages.length > 0 && wordCount > 0 && (
              <p className="text-xs text-slate-400 mt-2">
                Estimated cost: <span className="font-medium text-slate-600">${estimatedCostPreview.toFixed(2)}</span> ({wordCount} words across {selectedLanguages.length} language{selectedLanguages.length > 1 ? "s" : ""})
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                {sources.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Your name"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
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
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              className={`flex items-center gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer w-fit ${
                screenshotAttached ? "border-copeland-blue bg-blue-50 text-copeland-navy" : "border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={screenshotAttached}
                onChange={(e) => setScreenshotAttached(e.target.checked)}
                className="accent-copeland-blue"
              />
              <ImagePlus className="h-4 w-4" />
              Attach a screenshot for context (optional)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-copeland-blue text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-copeland-navy disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Submit request
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useGlossary } from "../context/GlossaryContext";
import { useAuth } from "../context/AuthContext";
import languages from "../data/languages.json";
import { Plus, Check, X } from "lucide-react";

export default function Glossary() {
  const { terms, suggestions, addTerm, updateTerm, suggestTerm, approveSuggestion, rejectSuggestion } = useGlossary();
  const { role, persona } = useAuth();
  const isAdmin = role === "Admin";

  const [showAddTerm, setShowAddTerm] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestTermText, setSuggestTermText] = useState("");
  const [suggestTranslation, setSuggestTranslation] = useState("");

  const handleAddTerm = (e) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    addTerm({ term: newTerm.trim().toLowerCase(), category: newCategory.trim() || "Uncategorized", translations: {} });
    setNewTerm("");
    setNewCategory("");
    setShowAddTerm(false);
  };

  const handleSuggest = (e) => {
    e.preventDefault();
    if (!suggestTermText.trim() || !suggestTranslation.trim()) return;
    suggestTerm({
      term: suggestTermText.trim().toLowerCase(),
      category: "Suggested",
      langCode: persona.language,
      translation: suggestTranslation.trim(),
      suggestedBy: persona.name,
    });
    setSuggestTermText("");
    setSuggestTranslation("");
    setShowSuggest(false);
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "Pending");
  const visibleLanguages = isAdmin ? languages : languages.filter((l) => l.code === persona?.language);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-slate-900 mb-1">Glossary</h2>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? "Approved technical terms and their translations."
              : `Approved terms for ${languages.find((l) => l.code === persona?.language)?.name}.`}
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setShowAddTerm((s) => !s)}
            className="bg-copeland-blue text-white px-4 py-2 text-sm font-medium hover:bg-copeland-navy inline-flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add term
          </button>
        ) : (
          <button
            onClick={() => setShowSuggest((s) => !s)}
            className="border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Suggest a new term
          </button>
        )}
      </div>

      {isAdmin && showAddTerm && (
        <form onSubmit={handleAddTerm} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Term</label>
            <input
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="bg-copeland-blue text-white px-4 py-1.5 text-sm font-medium">
            Add
          </button>
        </form>
      )}

      {!isAdmin && showSuggest && (
        <form onSubmit={handleSuggest} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Term</label>
            <input
              value={suggestTermText}
              onChange={(e) => setSuggestTermText(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Translation ({persona.language})
            </label>
            <input
              value={suggestTranslation}
              onChange={(e) => setSuggestTranslation(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="bg-copeland-blue text-white px-4 py-1.5 text-sm font-medium">
            Submit suggestion
          </button>
        </form>
      )}

      {isAdmin && pendingSuggestions.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Term suggestions awaiting review</h3>
          <div className="space-y-2">
            {pendingSuggestions.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm border border-slate-100 rounded-md px-3 py-2">
                <span>
                  <span className="font-medium capitalize">{s.term}</span> → {s.langCode}: "{s.translation}"{" "}
                  <span className="text-xs text-slate-400">suggested by {s.suggestedBy}</span>
                </span>
                <div className="flex gap-2">
                  <button onClick={() => approveSuggestion(s.id)} className="text-emerald-600 hover:text-emerald-700">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => rejectSuggestion(s.id)} className="text-red-500 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {terms.map((t) => (
          <div key={t.term} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800 capitalize">{t.term}</span>
              <span className="text-xs text-slate-400">{t.category}</span>
            </div>
            <div className={`grid gap-1.5 ${isAdmin ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
              {visibleLanguages.map((l) => {
                const value = t.translations[l.code];
                return (
                  <div key={l.code} className="text-xs rounded px-2 py-1 bg-slate-50 flex items-center gap-2">
                    <span className="text-slate-400 shrink-0">{l.code}</span>
                    {isAdmin ? (
                      <input
                        defaultValue={value || ""}
                        onBlur={(e) => updateTerm(t.term, { translations: { [l.code]: e.target.value } })}
                        className="flex-1 min-w-0 text-right bg-transparent focus:outline-none font-medium"
                        placeholder="—"
                      />
                    ) : (
                      <span className="font-medium">{value || "—"}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

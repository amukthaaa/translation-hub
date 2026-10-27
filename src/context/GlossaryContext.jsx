import { createContext, useContext, useMemo, useState } from "react";
import initialGlossary from "../data/glossary.json";

const GlossaryContext = createContext(null);

let nextSuggestionId = 1;

export function GlossaryProvider({ children }) {
  const [terms, setTerms] = useState(initialGlossary);
  const [suggestions, setSuggestions] = useState([]);

  const addTerm = (entry) => {
    setTerms((prev) => [...prev, { translations: {}, ...entry }]);
  };

  const updateTerm = (term, patch) => {
    setTerms((prev) =>
      prev.map((t) =>
        t.term !== term
          ? t
          : { ...t, ...patch, translations: { ...t.translations, ...(patch.translations || {}) } }
      )
    );
  };

  const suggestTerm = ({ term, category, langCode, translation, suggestedBy }) => {
    setSuggestions((prev) => [
      ...prev,
      {
        id: `sg-${nextSuggestionId++}`,
        term,
        category,
        langCode,
        translation,
        suggestedBy,
        status: "Pending",
      },
    ]);
  };

  const approveSuggestion = (id) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (!suggestion) return;
    setTerms((prev) => {
      const existing = prev.find((t) => t.term.toLowerCase() === suggestion.term.toLowerCase());
      if (existing) {
        return prev.map((t) =>
          t === existing
            ? { ...t, translations: { ...t.translations, [suggestion.langCode]: suggestion.translation } }
            : t
        );
      }
      return [
        ...prev,
        {
          term: suggestion.term,
          category: suggestion.category || "Uncategorized",
          translations: { [suggestion.langCode]: suggestion.translation },
        },
      ];
    });
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Approved" } : s)));
  };

  const rejectSuggestion = (id) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Rejected" } : s)));
  };

  const value = useMemo(
    () => ({ terms, suggestions, addTerm, updateTerm, suggestTerm, approveSuggestion, rejectSuggestion }),
    [terms, suggestions]
  );

  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>;
}

export function useGlossary() {
  const ctx = useContext(GlossaryContext);
  if (!ctx) throw new Error("useGlossary must be used within GlossaryProvider");
  return ctx;
}

// Derives a request's overall status from its per-language statuses, so Dashboard/Admin
// views stay live as Reviewers and Translators act, instead of trusting a static field.
export function deriveOverallStatus(languages) {
  if (languages.length > 0 && languages.every((l) => l.status === "Published")) return "Published";
  if (languages.some((l) => l.status === "In Review" || l.status === "Changes Requested")) return "In Review";
  if (languages.some((l) => l.status === "In Translation")) return "In Translation";
  return "Submitted";
}

const TRANSLATOR_LABELS = {
  Submitted: "Not Started",
  "In Translation": "In Progress",
  "In Review": "Submitted for Review",
  "Changes Requested": "Changes Requested",
  Published: "Published",
};

export function translatorStatusLabel(status) {
  return TRANSLATOR_LABELS[status] || status;
}

// A request's shared fields (title, source text, deadline, priority...) can only be
// edited by the Content Owner while every language is still pre-review — once any
// language reaches In Review/Changes Requested/Published, a translator or reviewer is
// already relying on the current text, so edits are locked.
export function canEditRequest(request) {
  return request.languages.every((l) => l.status === "Submitted" || l.status === "In Translation");
}

import { findGlossaryMatches } from "./glossary";

// Flags glossary terms detected in the source whose approved translation does not
// appear (case-insensitively) in the submitted translation — "refrigerant" drift, etc.
export function findTranslationMismatches(sourceText, translatedText, glossary, langCode) {
  const matches = findGlossaryMatches(sourceText, glossary);
  const distinct = Array.from(new Map(matches.map((m) => [m.term, m])).values());
  const haystack = (translatedText || "").toLowerCase();

  return distinct
    .filter((m) => m.translations[langCode])
    .map((m) => {
      const approved = m.translations[langCode];
      const found = haystack.includes(approved.toLowerCase());
      return { term: m.term, approved, found };
    })
    .filter((m) => !m.found);
}

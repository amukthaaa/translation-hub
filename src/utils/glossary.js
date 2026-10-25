// Finds glossary term occurrences in a block of source text.
// Longest terms are matched first so "condensing unit" wins over "condenser".
export function findGlossaryMatches(text, glossary) {
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const matches = [];
  const claimed = new Array(text.length).fill(false);

  for (const entry of sorted) {
    const pattern = new RegExp(`\\b${escapeRegExp(entry.term)}\\b`, "gi");
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const overlaps = claimed.slice(start, end).some(Boolean);
      if (!overlaps) {
        for (let i = start; i < end; i++) claimed[i] = true;
        matches.push({ term: entry.term, category: entry.category, translations: entry.translations, start, end, text: match[0] });
      }
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Returns the set of distinct glossary entries referenced by a text block,
// each annotated with which of the requested target languages lack an approved translation.
export function glossaryCoverage(text, glossary, targetLanguageCodes) {
  const matches = findGlossaryMatches(text, glossary);
  const seen = new Map();
  for (const m of matches) {
    if (!seen.has(m.term)) {
      const missing = targetLanguageCodes.filter((code) => !m.translations[code]);
      seen.set(m.term, { term: m.term, category: m.category, translations: m.translations, missing });
    }
  }
  return Array.from(seen.values());
}

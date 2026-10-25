import { findGlossaryMatches } from "../utils/glossary";

export default function HighlightedText({ text, glossary, targetLanguageCodes = [] }) {
  const matches = findGlossaryMatches(text, glossary);

  if (matches.length === 0) {
    return <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{text}</p>;
  }

  const nodes = [];
  let cursor = 0;

  matches.forEach((m, i) => {
    if (m.start > cursor) {
      nodes.push(<span key={`t-${i}`}>{text.slice(cursor, m.start)}</span>);
    }
    const missing = targetLanguageCodes.filter((code) => !m.translations[code]);
    const isIncomplete = missing.length > 0;
    nodes.push(
      <span
        key={`m-${i}`}
        title={
          isIncomplete
            ? `"${m.term}" — missing approved translation for ${missing.length} language(s)`
            : `"${m.term}" — approved glossary term`
        }
        className={
          isIncomplete
            ? "rounded px-1 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-medium cursor-help"
            : "rounded px-1 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium cursor-help"
        }
      >
        {m.text}
      </span>
    );
    cursor = m.end;
  });

  if (cursor < text.length) {
    nodes.push(<span key="t-last">{text.slice(cursor)}</span>);
  }

  return <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{nodes}</p>;
}

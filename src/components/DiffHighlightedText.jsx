import { diffWords } from "../utils/diff";

export default function DiffHighlightedText({ oldText, newText }) {
  const tokens = diffWords(oldText, newText);

  return (
    <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
      {tokens.map((t, i) =>
        t.changed ? (
          <mark key={i} className="bg-yellow-200 text-slate-900 rounded px-0.5">
            {t.value}
          </mark>
        ) : (
          <span key={i}>{t.value}</span>
        )
      )}
    </p>
  );
}

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export default function OnboardingNote() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-copeland-navy">
          <Info className="h-4 w-4" /> New here? Quick notes on how this works
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-copeland-navy" /> : <ChevronDown className="h-4 w-4 text-copeland-navy" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-700 space-y-2 border-t border-blue-200 pt-3">
          <p>
            <span className="font-medium">When to submit:</span> submit a request as soon as content is final —
            don't wait for every language to be decided, you can add more later.
          </p>
          <p>
            <span className="font-medium">How glossary terms work:</span> approved technical terms (refrigerant,
            compressor, superheat, etc.) are detected automatically and flagged in your request. A term shown
            without an approved translation for a target language needs a reviewer's sign-off before it's used.
          </p>
          <p>
            <span className="font-medium">Who approves what:</span> each target language has a regional reviewer
            assigned by your Admin who approves the translation before it moves to Published.
          </p>
        </div>
      )}
    </div>
  );
}

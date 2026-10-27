import { createContext, useContext, useMemo, useState } from "react";
import initialRequests from "../data/requests.json";
import costs from "../data/costs.json";
import users from "../data/users.json";

const RequestsContext = createContext(null);

const rateByCode = Object.fromEntries(costs.map((c) => [c.code, c.ratePerWord]));
const reviewerByCode = Object.fromEntries(
  users.filter((u) => u.role === "Reviewer").map((u) => [u.language, u.name])
);
const translatorByCode = Object.fromEntries(
  users.filter((u) => u.role === "Translator").map((u) => [u.language, u.name])
);

let nextIdCounter = 1051;
let nextOrderRefCounter = 48260;
let nextCommentId = 1;

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState(initialRequests);

  const addRequest = (draft) => {
    const id = `REQ-${nextIdCounter++}`;
    const words = wordCount(draft.sourceText);
    const languages = draft.languageCodes.map((code) => {
      const rate = rateByCode[code] ?? 0.15;
      return {
        code,
        status: "Submitted",
        reviewer: reviewerByCode[code] ?? null,
        translator: translatorByCode[code] ?? null,
        cost: round2(words * rate),
      };
    });
    const estimatedCost = round2(languages.reduce((sum, l) => sum + l.cost, 0));

    const newRequest = {
      id,
      status: "Submitted",
      createdAt: today(),
      wordCount: words,
      estimatedCost,
      orderRef: `PO-${nextOrderRefCounter++}`,
      languages,
      ...draft,
    };
    delete newRequest.languageCodes;
    setRequests((prev) => [newRequest, ...prev]);
    return id;
  };

  const updateLanguage = (requestId, code, patchOrFn) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== requestId
          ? r
          : {
              ...r,
              languages: r.languages.map((l) => {
                if (l.code !== code) return l;
                const patch = typeof patchOrFn === "function" ? patchOrFn(l) : patchOrFn;
                return { ...l, ...patch };
              }),
            }
      )
    );
  };

  const appendComment = (l, { role, author, text }) => ({
    comments: [
      ...(l.comments || []),
      { id: `c-${nextCommentId++}`, role, author, text, createdAt: today() },
    ],
  });

  const saveDraft = (requestId, code, text) => {
    updateLanguage(requestId, code, {
      translatedText: text,
      status: "In Translation",
    });
  };

  const submitForReview = (requestId, code, text) => {
    updateLanguage(requestId, code, {
      translatedText: text,
      status: "In Review",
    });
  };

  const approveLanguage = (requestId, code) => {
    updateLanguage(requestId, code, {
      status: "Published",
      completedAt: today(),
    });
  };

  const requestChanges = (requestId, code, comment, author) => {
    updateLanguage(requestId, code, (l) => ({
      status: "Changes Requested",
      ...appendComment(l, { role: "Reviewer", author, text: comment }),
    }));
  };

  const replyToComment = (requestId, code, text, author) => {
    updateLanguage(requestId, code, (l) => appendComment(l, { role: "Translator", author, text }));
  };

  const updateRequest = (requestId, patch) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;

        const sourceTextChanged = "sourceText" in patch && patch.sourceText !== r.sourceText;
        const words = sourceTextChanged ? wordCount(patch.sourceText) : r.wordCount;

        const languages = r.languages.map((l) => {
          const rate = rateByCode[l.code] ?? 0.15;
          const cost = sourceTextChanged ? round2(words * rate) : l.cost;
          if (l.status !== "In Translation") {
            return sourceTextChanged ? { ...l, cost } : l;
          }
          return {
            ...l,
            cost,
            needsAttention: true,
            ...appendComment(l, {
              role: "System",
              author: "System",
              text: sourceTextChanged
                ? "The content owner updated the source text. Please review your draft against the revised content before submitting."
                : "The content owner updated this request's details.",
            }),
          };
        });

        return {
          ...r,
          ...patch,
          wordCount: words,
          estimatedCost: round2(languages.reduce((sum, l) => sum + l.cost, 0)),
          languages,
        };
      })
    );
  };

  const acknowledgeUpdate = (requestId, code) => {
    updateLanguage(requestId, code, { needsAttention: false });
  };

  const value = useMemo(
    () => ({
      requests,
      addRequest,
      saveDraft,
      submitForReview,
      approveLanguage,
      requestChanges,
      replyToComment,
      updateRequest,
      acknowledgeUpdate,
    }),
    [requests]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error("useRequests must be used within RequestsProvider");
  return ctx;
}

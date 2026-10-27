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

  const updateLanguage = (requestId, code, patch) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== requestId
          ? r
          : { ...r, languages: r.languages.map((l) => (l.code !== code ? l : { ...l, ...patch })) }
      )
    );
  };

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
      reviewerComment: null,
    });
  };

  const approveLanguage = (requestId, code) => {
    updateLanguage(requestId, code, {
      status: "Published",
      completedAt: today(),
      reviewerComment: null,
    });
  };

  const requestChanges = (requestId, code, comment) => {
    updateLanguage(requestId, code, {
      status: "Changes Requested",
      reviewerComment: comment,
    });
  };

  const value = useMemo(
    () => ({ requests, addRequest, saveDraft, submitForReview, approveLanguage, requestChanges }),
    [requests]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error("useRequests must be used within RequestsProvider");
  return ctx;
}

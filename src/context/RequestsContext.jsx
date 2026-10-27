import { createContext, useContext, useMemo, useState } from "react";
import initialRequests from "../data/requests.json";
import costs from "../data/costs.json";

const RequestsContext = createContext(null);

const rateByCode = Object.fromEntries(costs.map((c) => [c.code, c.ratePerWord]));

let nextIdCounter = 1051;
let nextOrderRefCounter = 48260;

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState(initialRequests);

  const addRequest = (draft) => {
    const id = `REQ-${nextIdCounter++}`;
    const words = wordCount(draft.sourceText);
    const languages = draft.languageCodes.map((code) => {
      const rate = rateByCode[code] ?? 0.15;
      return { code, status: "Submitted", reviewer: null, cost: round2(words * rate) };
    });
    const estimatedCost = round2(languages.reduce((sum, l) => sum + l.cost, 0));

    const newRequest = {
      id,
      status: "Submitted",
      createdAt: new Date().toISOString().slice(0, 10),
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

  const value = useMemo(() => ({ requests, addRequest }), [requests]);

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error("useRequests must be used within RequestsProvider");
  return ctx;
}

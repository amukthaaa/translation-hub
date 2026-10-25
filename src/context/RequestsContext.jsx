import { createContext, useContext, useMemo, useState } from "react";
import initialRequests from "../data/requests.json";

const RequestsContext = createContext(null);

let nextIdCounter = 1051;

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState(initialRequests);

  const addRequest = (draft) => {
    const id = `REQ-${nextIdCounter++}`;
    const newRequest = {
      id,
      status: "Submitted",
      createdAt: new Date().toISOString().slice(0, 10),
      languages: draft.languageCodes.map((code) => ({ code, status: "Submitted", reviewer: null })),
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

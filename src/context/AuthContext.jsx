import { createContext, useContext, useMemo, useState } from "react";
import personas from "../data/personas.json";

const AuthContext = createContext(null);
const STORAGE_KEY = "copeland-hub-demo-role";

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const login = (nextRole) => {
    setRole(nextRole);
    try {
      localStorage.setItem(STORAGE_KEY, nextRole);
    } catch {
      // ignore (private browsing, etc.)
    }
  };

  const logout = () => {
    setRole(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const persona = useMemo(() => personas.find((p) => p.role === role) || null, [role]);

  const value = useMemo(() => ({ role, persona, personas, login, logout }), [role, persona]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

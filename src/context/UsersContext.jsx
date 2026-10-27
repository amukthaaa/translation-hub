import { createContext, useContext, useMemo, useState } from "react";
import initialUsers from "../data/users.json";

const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const [users, setUsers] = useState(initialUsers);

  const updateUserRole = (id, role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const updateReviewerAssignment = (id, fields) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...fields } : u)));
  };

  const toggleActive = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const value = useMemo(
    () => ({ users, updateUserRole, updateReviewerAssignment, toggleActive }),
    [users]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}

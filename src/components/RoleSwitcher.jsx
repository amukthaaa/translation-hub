import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME } from "../config/roles";
import { ChevronDown, LogOut } from "lucide-react";

export default function RoleSwitcher() {
  const { role, persona, personas, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchTo = (nextRole) => {
    login(nextRole);
    setOpen(false);
    navigate(ROLE_HOME[nextRole], { replace: true });
  };

  const exitDemo = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!persona) return null;

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
      >
        <span className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-medium">
          {persona.initials}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-medium">{persona.name}</span>
          <span className="block text-xs text-blue-200">{role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-blue-200" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 shadow-lg z-20 text-slate-700">
          <p className="px-3 py-2 text-xs font-medium text-slate-400 border-b border-slate-100">Switch role</p>
          {personas.map((p) => (
            <button
              key={p.role}
              onClick={() => switchTo(p.role)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                p.role === role ? "text-copeland-blue font-medium" : ""
              }`}
            >
              {p.role}
              <span className="text-xs text-slate-400">{p.name}</span>
            </button>
          ))}
          <button
            onClick={exitDemo}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 flex items-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit demo
          </button>
        </div>
      )}
    </div>
  );
}

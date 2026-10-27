import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_NAV, ROLE_HOME, isPathAllowed } from "../config/roles";
import RoleSwitcher from "./RoleSwitcher";
import copelandLogo from "../assets/copeland-logo.png";

export default function Layout() {
  const { role } = useAuth();
  const location = useLocation();

  if (!role) return <Navigate to="/login" replace />;
  if (!isPathAllowed(role, location.pathname)) return <Navigate to={ROLE_HOME[role]} replace />;

  const navItems = ROLE_NAV[role] || [];

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="bg-copeland-navy text-white"
        style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={copelandLogo} alt="Copeland" className="h-12 w-12 rounded-md" />
            <div>
              <h1 className="text-lg font-semibold leading-tight">Translation Request Hub</h1>
              <p className="text-xs text-blue-200">Prototype</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-white text-copeland-navy" : "text-blue-100 hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <RoleSwitcher />
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-400">
          Prototype — mock data only, no real translation or backend. Built to explore a translation request workflow.
        </div>
      </footer>
    </div>
  );
}

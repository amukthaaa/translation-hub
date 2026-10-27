import { NavLink, Outlet } from "react-router-dom";
import { Globe2 } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/new", label: "New Request" },
  { to: "/metrics", label: "Metrics" },
  { to: "/admin", label: "Admin" },
  { to: "/backlog", label: "Backlog" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-copeland-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-blue-300" />
            <div>
              <h1 className="text-lg font-semibold leading-tight">Copeland Translation Request Hub</h1>
              <p className="text-xs text-blue-200">Prototype</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-white text-copeland-navy" : "text-blue-100 hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
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

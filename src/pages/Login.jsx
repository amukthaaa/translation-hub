import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME } from "../config/roles";
import copelandLogo from "../assets/copeland-logo.png";

export default function Login() {
  const { personas, login } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role) => {
    login(role);
    navigate(ROLE_HOME[role], { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <img src={copelandLogo} alt="Copeland" className="h-16 w-16 rounded-md mx-auto mb-5" />
        <h1 className="text-3xl font-medium text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}>
          Copeland Translation Hub
        </h1>
        <p className="text-sm text-slate-500 mt-2 mb-10">Choose a role to explore the demo.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {personas.map((p) => (
            <button
              key={p.role}
              onClick={() => handleSelect(p.role)}
              className="bg-white border border-slate-200 p-5 hover:border-copeland-blue hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-copeland-navy text-white flex items-center justify-center text-sm font-medium shrink-0">
                  {p.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.role}</p>
                  <p className="text-xs text-slate-400">{p.name}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">{p.blurb}</p>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-10">
          Prototype — no real authentication. Each card signs you in as that mock user.
        </p>
      </div>
    </div>
  );
}

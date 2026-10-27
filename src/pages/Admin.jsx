import { useUsers } from "../context/UsersContext";
import roles from "../data/roles.json";
import languages from "../data/languages.json";
import Select from "../components/Select";

const ROLE_NAMES = roles.map((r) => r.name);
const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function Admin() {
  const { users, updateUserRole, updateReviewerAssignment, toggleActive } = useUsers();
  const reviewers = users.filter((u) => u.role === "Reviewer");

  const reviewerForLanguage = (code) => reviewers.find((r) => r.language === code);

  const reassignReviewer = (code, newReviewerId) => {
    const current = reviewerForLanguage(code);
    if (current && current.id !== newReviewerId) {
      updateReviewerAssignment(current.id, { language: null });
    }
    if (newReviewerId) {
      const newReviewer = reviewers.find((r) => r.id === newReviewerId);
      updateReviewerAssignment(newReviewerId, { language: code, region: newReviewer?.region });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-medium text-slate-900 mb-1">Admin</h2>
      <p className="text-sm text-slate-500 mb-6">Manage users, roles, and reviewer assignments.</p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Context</th>
              <th className="px-4 py-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <Select
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                    className="border border-slate-300 rounded-md pl-2 pr-7 py-1 text-sm"
                    chevronClassName="right-2"
                  >
                    {ROLE_NAMES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.team && <span>{u.team}</span>}
                  {u.language && (
                    <span>
                      {languageName(u.language)}
                      {u.region ? ` · ${u.region}` : ""}
                    </span>
                  )}
                  {!u.team && !u.language && <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u.id)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      u.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {u.active ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Reviewer assignments by language</h3>
          <div className="space-y-2">
            {languages.map((l) => {
              const assigned = reviewerForLanguage(l.code);
              return (
                <div key={l.code} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600 w-40 shrink-0">{l.name}</span>
                  <Select
                    value={assigned?.id ?? ""}
                    onChange={(e) => reassignReviewer(l.code, e.target.value || null)}
                    wrapperClassName="flex-1"
                    className="w-full border border-slate-300 rounded-md pl-2 pr-7 py-1.5 text-sm"
                    chevronClassName="right-2"
                  >
                    <option value="">Unassigned</option>
                    {reviewers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.region ? `(${r.region})` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Role definitions</h3>
          <div className="space-y-3">
            {roles.map((r) => (
              <div key={r.name} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                <p className="text-sm font-medium text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

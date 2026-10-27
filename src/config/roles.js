export const ROLE_HOME = {
  "Content Owner": "/my-requests",
  Reviewer: "/review-queue",
  Translator: "/my-jobs",
  Admin: "/admin-dashboard",
};

export const ROLE_NAV = {
  "Content Owner": [
    { to: "/my-requests", label: "My Requests" },
    { to: "/new-request", label: "New Request" },
  ],
  Reviewer: [
    { to: "/review-queue", label: "Review Queue" },
    { to: "/glossary", label: "Glossary" },
  ],
  Translator: [{ to: "/my-jobs", label: "My Jobs" }],
  Admin: [
    { to: "/admin-dashboard", label: "Dashboard" },
    { to: "/all-requests", label: "All Requests" },
    { to: "/metrics", label: "Metrics" },
    { to: "/users-roles", label: "Users & Roles" },
    { to: "/glossary", label: "Glossary" },
    { to: "/backlog", label: "Backlog" },
  ],
};

export const ROLE_ALLOWED_PREFIXES = {
  "Content Owner": ["/my-requests", "/new-request", "/request"],
  Reviewer: ["/review-queue", "/review", "/glossary"],
  Translator: ["/my-jobs", "/job"],
  Admin: ["/admin-dashboard", "/all-requests", "/metrics", "/users-roles", "/glossary", "/backlog", "/request"],
};

export function isPathAllowed(role, pathname) {
  const prefixes = ROLE_ALLOWED_PREFIXES[role] || [];
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

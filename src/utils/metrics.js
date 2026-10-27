const MONTH_LABELS = {
  "2026-09": "Sep 2026",
  "2026-10": "Oct 2026",
  "2026-11": "Nov 2026",
};

export function volumeByMonth(requests) {
  const byMonth = new Map();
  for (const r of requests) {
    const month = r.createdAt.slice(0, 7);
    const entry = byMonth.get(month) || { month, requests: 0, words: 0 };
    entry.requests += 1;
    entry.words += r.wordCount || 0;
    byMonth.set(month, entry);
  }
  return Array.from(byMonth.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((e) => ({ ...e, label: MONTH_LABELS[e.month] || e.month }));
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

export function avgTurnaroundByLanguage(requests) {
  const byLang = new Map();
  for (const r of requests) {
    for (const l of r.languages) {
      if (!l.completedAt) continue;
      const days = daysBetween(r.createdAt, l.completedAt);
      const entry = byLang.get(l.code) || { code: l.code, totalDays: 0, count: 0 };
      entry.totalDays += days;
      entry.count += 1;
      byLang.set(l.code, entry);
    }
  }
  return Array.from(byLang.values())
    .map((e) => ({ code: e.code, avgDays: Math.round((e.totalDays / e.count) * 10) / 10, count: e.count }))
    .sort((a, b) => a.avgDays - b.avgDays);
}

export function requestsBySource(requests) {
  const bySource = new Map();
  for (const r of requests) {
    bySource.set(r.source, (bySource.get(r.source) || 0) + 1);
  }
  return Array.from(bySource.entries()).map(([source, count]) => ({ source, count }));
}

export function totalSpend(requests) {
  return Math.round(requests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0) * 100) / 100;
}

export function requestsByTeam(requests, users) {
  const teamByOwner = new Map(users.map((u) => [u.name, u.team]).filter(([, team]) => team));
  const byTeam = new Map();
  for (const r of requests) {
    const team = teamByOwner.get(r.owner) || "Other";
    byTeam.set(team, (byTeam.get(team) || 0) + 1);
  }
  return Array.from(byTeam.entries()).map(([team, count]) => ({ team, count }));
}

export function activeUserCount(users) {
  return users.filter((u) => u.active).length;
}

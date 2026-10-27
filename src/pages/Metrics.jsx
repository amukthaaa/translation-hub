import { useMemo } from "react";
import { useRequests } from "../context/RequestsContext";
import { useUsers } from "../context/UsersContext";
import languages from "../data/languages.json";
import MetricCard from "../components/MetricCard";
import BarRow from "../components/BarRow";
import {
  volumeByMonth,
  avgTurnaroundByLanguage,
  requestsBySource,
  totalSpend,
  requestsByTeam,
  activeUserCount,
} from "../utils/metrics";

const languageName = (code) => languages.find((l) => l.code === code)?.name || code;

export default function Metrics() {
  const { requests } = useRequests();
  const { users } = useUsers();

  const volume = useMemo(() => volumeByMonth(requests), [requests]);
  const turnaround = useMemo(() => avgTurnaroundByLanguage(requests), [requests]);
  const bySource = useMemo(() => requestsBySource(requests), [requests]);
  const byTeam = useMemo(() => requestsByTeam(requests, users), [requests, users]);
  const spend = useMemo(() => totalSpend(requests), [requests]);
  const activeUsers = useMemo(() => activeUserCount(users), [users]);

  const totalWords = requests.reduce((sum, r) => sum + (r.wordCount || 0), 0);
  const overallAvgTurnaround =
    turnaround.length > 0
      ? Math.round((turnaround.reduce((s, t) => s + t.avgDays * t.count, 0) / turnaround.reduce((s, t) => s + t.count, 0)) * 10) / 10
      : null;

  const maxVolume = Math.max(...volume.map((v) => v.requests), 1);
  const maxWords = Math.max(...volume.map((v) => v.words), 1);
  const maxTurnaround = Math.max(...turnaround.map((t) => t.avgDays), 1);
  const maxSource = Math.max(...bySource.map((s) => s.count), 1);
  const maxTeam = Math.max(...byTeam.map((t) => t.count), 1);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">Metrics</h2>
      <p className="text-sm text-slate-500 mb-6">Translation volume, turnaround, spend, and platform utilization at a glance.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total requests" value={requests.length} />
        <MetricCard label="Total words" value={totalWords.toLocaleString()} />
        <MetricCard label="Total estimated spend" value={`$${spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <MetricCard label="Active users" value={activeUsers} sublabel={`of ${users.length} total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Volume by month (requests)</h3>
          <div className="space-y-3">
            {volume.map((v) => (
              <BarRow key={v.month} label={v.label} value={v.requests} max={maxVolume} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Volume by month (word count)</h3>
          <div className="space-y-3">
            {volume.map((v) => (
              <BarRow key={v.month} label={v.label} value={v.words} max={maxWords} barClassName="bg-copeland-navy" />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Average turnaround by language</h3>
            {overallAvgTurnaround !== null && (
              <span className="text-xs text-slate-400">overall avg {overallAvgTurnaround}d</span>
            )}
          </div>
          {turnaround.length === 0 ? (
            <p className="text-sm text-slate-400">No published requests yet to measure turnaround from.</p>
          ) : (
            <div className="space-y-3">
              {turnaround.map((t) => (
                <BarRow
                  key={t.code}
                  label={languageName(t.code)}
                  value={t.avgDays}
                  max={maxTurnaround}
                  formatValue={(v) => `${v}d`}
                  barClassName="bg-emerald-500"
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Requests by source system</h3>
          <div className="space-y-3">
            {bySource.map((s) => (
              <BarRow key={s.source} label={s.source} value={s.count} max={maxSource} barClassName="bg-amber-500" />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Platform utilization — requests per team</h3>
          <div className="space-y-3">
            {byTeam.map((t) => (
              <BarRow key={t.team} label={t.team} value={t.count} max={maxTeam} barClassName="bg-copeland-blue" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

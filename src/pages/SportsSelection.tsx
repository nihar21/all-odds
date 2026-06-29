import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Label, SearchField } from 'react-aria-components';
import { getSportsList } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { sportIcon } from '../constants';
import { CardGridSkeleton } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';

interface SportGroup {
  group: string;
  leagueCount: number;
}

export function SportsSelection() {
  const { data, loading, error } = useAsync(getSportsList, []);
  const [query, setQuery] = useState('');

  const groups = useMemo<SportGroup[]>(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const sport of data) {
      if (!sport.group) continue;
      counts.set(sport.group, (counts.get(sport.group) ?? 0) + 1);
    }
    return Array.from(counts, ([group, leagueCount]) => ({ group, leagueCount })).sort(
      (a, b) => a.group.localeCompare(b.group),
    );
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? groups.filter((g) => g.group.toLowerCase().includes(q)) : groups;
  }, [groups, query]);

  return (
    <div>
      <section className="mb-8 animate-fade-up">
        <span className="pill mb-4 border-accent/30 bg-accent/10 text-accent-soft">
          Live across every major sportsbook
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Find the best odds, instantly.
        </h1>
        <p className="mt-3 max-w-xl text-slate-400">
          Compare moneylines, spreads, and totals side by side. Pick a sport to
          dive into live lines from FanDuel, DraftKings, BetMGM and more.
        </p>
      </section>

      {!loading && !error && groups.length > 0 && (
        <SearchField
          value={query}
          onChange={setQuery}
          aria-label="Search sports"
          className="mb-6 block max-w-sm"
        >
          <Label className="sr-only">Search sports</Label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-800/80 px-3.5 py-2.5 transition focus-within:border-accent/50">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input
              placeholder="Search sports…"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </SearchField>
      )}

      {loading && <CardGridSkeleton />}

      {error && (
        <ErrorView
          title="Couldn't load sports"
          message={`${error} The odds API may be rate-limited — try again shortly.`}
        />
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="py-10 text-center text-slate-400">
          No sports match “{query}”.
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((g, i) => (
            <li
              key={g.group}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <Link
                to={`/sport/${encodeURIComponent(g.group)}`}
                className="card-surface group flex h-full flex-col justify-between gap-6 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow"
              >
                <span className="text-3xl">{sportIcon(g.group)}</span>
                <span>
                  <span className="block font-display text-base font-semibold text-white">
                    {g.group}
                  </span>
                  <span className="text-xs text-slate-500">
                    {g.leagueCount} league{g.leagueCount === 1 ? '' : 's'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

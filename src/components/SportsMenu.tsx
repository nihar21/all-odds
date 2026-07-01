import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { getSportsList } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { sportIcon } from '../constants';
import type { Sport } from '../types';

interface SportGroup {
  group: string;
  leagueCount: number;
}

function ExpanderChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * Hamburger menu that surfaces the home-screen navigation — the list of sport
 * groups plus the cross-sport Live view — from any page. Reuses `getSportsList`
 * (cached for the session) and the same grouping the home page derives.
 */
export function SportsMenu() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { data, loading, error } = useAsync(getSportsList, []);

  const groups = useMemo<SportGroup[]>(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const sport of data) {
      if (!sport.group) continue;
      counts.set(sport.group, (counts.get(sport.group) ?? 0) + 1);
    }
    return Array.from(counts, ([group, leagueCount]) => ({
      group,
      leagueCount,
    })).sort((a, b) => a.group.localeCompare(b.group));
  }, [data]);

  const leaguesByGroup = useMemo(() => {
    const map = new Map<string, Sport[]>();
    for (const sport of data ?? []) {
      if (!sport.group) continue;
      const list = map.get(sport.group) ?? [];
      list.push(sport);
      map.set(sport.group, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return map;
  }, [data]);

  // Close the menu whenever the route changes (e.g. after picking an item).
  useEffect(() => {
    setIsOpen(false);
    setExpandedGroup(null);
  }, [pathname]);

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        aria-label="Browse sports"
        className="group grid h-9 w-9 place-items-center rounded-lg text-slate-300 outline-none transition hover:bg-white/5 hover:text-white pressed:bg-white/10 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </Button>
      <Popover
        placement="bottom start"
        className="w-72 origin-top overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card entering:animate-fade-up"
      >
        <Dialog className="outline-none" aria-label="Browse sports">
          <Link
            to="/live"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3 text-sm font-semibold text-rose-200 outline-none transition hover:bg-rose-500/10 focus-visible:bg-rose-500/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
            </span>
            Live Sports
          </Link>

          <div className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sports
          </div>

          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400" role="status">
              Loading sports…
            </div>
          )}

          {error && (
            <div className="px-4 py-3 text-sm text-slate-400">
              Couldn&apos;t load sports.
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400">
              No sports available.
            </div>
          )}

          {!loading && !error && groups.length > 0 && (
            <ul className="max-h-[60vh] overflow-auto p-1">
              {groups.map((g, i) => {
                const expanded = expandedGroup === g.group;
                const leaguesId = `sportsmenu-leagues-${i}`;
                return (
                  <li key={g.group}>
                    <div className="flex items-center justify-between gap-1 rounded-lg text-sm text-slate-200 transition hover:bg-white/10">
                      <Link
                        to={`/sport/${encodeURIComponent(g.group)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 outline-none focus-visible:bg-white/10"
                      >
                        <span className="text-lg" aria-hidden="true">
                          {sportIcon(g.group)}
                        </span>
                        <span className="truncate">{g.group}</span>
                      </Link>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={leaguesId}
                        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${g.group} leagues`}
                        onClick={() =>
                          setExpandedGroup((current) =>
                            current === g.group ? null : g.group,
                          )
                        }
                        className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs text-slate-500 outline-none transition hover:bg-white/10 hover:text-slate-300 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70"
                      >
                        {g.leagueCount}
                        <ExpanderChevron expanded={expanded} />
                      </button>
                    </div>
                    <ul
                      id={leaguesId}
                      hidden={!expanded}
                      className="ml-4 border-l border-white/10 pl-3"
                    >
                      {(leaguesByGroup.get(g.group) ?? []).map((league) => (
                        <li key={league.key}>
                          <Link
                            to={`/sport/${encodeURIComponent(g.group)}/league/${league.key}`}
                            onClick={() => setIsOpen(false)}
                            className="block truncate rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none transition hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
                          >
                            {league.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

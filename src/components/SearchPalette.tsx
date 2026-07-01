import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { getSportsList } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { BACKEND_ENABLED } from '../lib/graphql/client';
import {
  hitHref,
  searchSportsAndLeagues,
  searchTeamsAndDatesViaGraphql,
  type SearchHit,
} from '../lib/search';

const DEBOUNCE_MS = 250;

const CATEGORY_LABELS: Record<SearchHit['category'], string> = {
  SPORT: 'Sports',
  LEAGUE: 'Leagues',
  TEAM: 'Teams',
  DATE: 'Dates',
};

const CATEGORY_ORDER: SearchHit['category'][] = ['SPORT', 'LEAGUE', 'TEAM', 'DATE'];

/**
 * Global search: a header icon (plus a Cmd/Ctrl-K shortcut from anywhere)
 * opens a command-palette overlay that fuzzy-matches sports/leagues instantly
 * from the already-cached list, and teams/dates via the GraphQL backend's
 * bounded "upcoming" event set (empty when no backend is configured, same
 * as every other backend-gated feature in this app).
 */
export function SearchPalette() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remoteHits, setRemoteHits] = useState<SearchHit[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: sports } = useAsync(getSportsList, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      // Popover mounts the input on open; focus it once it's in the DOM.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery('');
    setRemoteHits([]);
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    // Global Cmd/Ctrl-K opens the palette from anywhere.
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!BACKEND_ENABLED || !query.trim()) {
      setRemoteHits([]);
      setRemoteLoading(false);
      return undefined;
    }

    setRemoteLoading(true);
    let cancelled = false;
    const id = window.setTimeout(() => {
      searchTeamsAndDatesViaGraphql(query)
        .then((hits) => {
          if (!cancelled) setRemoteHits(hits);
        })
        .catch(() => {
          if (!cancelled) setRemoteHits([]);
        })
        .finally(() => {
          if (!cancelled) setRemoteLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query]);

  const localHits = useMemo(
    () => searchSportsAndLeagues(sports ?? [], query),
    [sports, query],
  );

  const grouped = useMemo(() => {
    const all = [...localHits, ...remoteHits];
    const byCategory = new Map<SearchHit['category'], SearchHit[]>();
    for (const hit of all) {
      const list = byCategory.get(hit.category) ?? [];
      list.push(hit);
      byCategory.set(hit.category, list);
    }
    return CATEGORY_ORDER.map((category) => ({
      category,
      hits: byCategory.get(category) ?? [],
    })).filter((g) => g.hits.length > 0);
  }, [localHits, remoteHits]);

  const flatHits = useMemo(() => grouped.flatMap((g) => g.hits), [grouped]);

  useEffect(() => {
    setActiveIndex(0);
  }, [flatHits.length, query]);

  function select(hit: SearchHit) {
    const href = hitHref(hit);
    if (href) {
      navigate(href);
      setIsOpen(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatHits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flatHits[activeIndex];
      if (hit) select(hit);
    }
  }

  const showEmpty =
    query.trim().length > 0 && !remoteLoading && flatHits.length === 0;
  let itemPosition = 0;

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        aria-label="Search sports, leagues, teams, and dates"
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
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </Button>
      <Popover
        placement="bottom end"
        className="w-[22rem] origin-top overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card entering:animate-fade-up sm:w-96"
      >
        <Dialog className="outline-none" aria-label="Search">
          <div className="border-b border-white/10 p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              type="text"
              placeholder="Search sports, leagues, teams, dates…"
              aria-label="Search sports, leagues, teams, and dates"
              aria-controls="search-palette-results"
              aria-activedescendant={
                flatHits[activeIndex] ? `search-hit-${activeIndex}` : undefined
              }
              className="w-full rounded-lg bg-transparent px-2.5 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div
            id="search-palette-results"
            role="listbox"
            aria-label="Search results"
            className="max-h-[60vh] overflow-auto p-1"
          >
            {remoteLoading && query.trim() && grouped.length === 0 && (
              <div className="px-3 py-3 text-sm text-slate-400" role="status">
                Searching…
              </div>
            )}

            {showEmpty && (
              <div className="px-3 py-3 text-sm text-slate-400">
                No matches for &ldquo;{query.trim()}&rdquo;.
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.category} className="mb-1 last:mb-0">
                <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {CATEGORY_LABELS[group.category]}
                </div>
                <ul>
                  {group.hits.map((hit) => {
                    const position = itemPosition++;
                    const active = position === activeIndex;
                    return (
                      <li key={`${hit.category}-${hit.label}-${position}`}>
                        <button
                          id={`search-hit-${position}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(position)}
                          onClick={() => select(hit)}
                          className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left text-sm outline-none transition ${
                            active ? 'bg-white/10 text-white' : 'text-slate-300'
                          }`}
                        >
                          <span className="truncate">{hit.label}</span>
                          {hit.subtitle && (
                            <span className="truncate text-xs text-slate-500">
                              {hit.subtitle}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

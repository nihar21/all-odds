import { useMemo, useState } from 'react';
import { getUpcomingOdds } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { useLiveScores } from '../hooks/useLiveScores';
import { isLive } from '../lib/odds';
import type { MarketKey, OddsEvent } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EventListSkeleton } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';
import { MarketSelect } from '../components/MarketSelect';
import { EventCard } from '../components/EventCard';

interface SportGroup {
  title: string;
  events: OddsEvent[];
}

export function LiveSports() {
  // Odds data is served from the session cache (see `cachedGet` in lib/api), so
  // the list of live games reflects a snapshot from first load and does not
  // auto-refresh — a deliberate tradeoff to conserve odds-API credits. Reload to
  // fetch newly-started games. (Live scores, fetched separately below via
  // `useLiveScores`, DO auto-refresh on a ~30s poll.)
  const { data, loading, error } = useAsync(() => getUpcomingOdds(), []);

  // Only games already in progress, grouped by sport and sorted by start time.
  const groups = useMemo<SportGroup[]>(() => {
    if (!data) return [];
    const live = data
      .filter((e) => isLive(e.commence_time))
      .sort(
        (a, b) =>
          new Date(a.commence_time).getTime() -
          new Date(b.commence_time).getTime(),
      );

    const bySport = new Map<string, OddsEvent[]>();
    for (const event of live) {
      const title = event.sport_title || 'Other';
      const list = bySport.get(title);
      if (list) list.push(event);
      else bySport.set(title, [event]);
    }
    return Array.from(bySport, ([title, events]) => ({ title, events })).sort(
      (a, b) => a.title.localeCompare(b.title),
    );
  }, [data]);

  const liveCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.events.length, 0),
    [groups],
  );

  // Distinct sport keys among the live events. The cross-sport `upcoming` key is
  // NOT valid for the /scores endpoint, so we poll each live sport individually.
  const liveSportKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const group of groups) {
      for (const event of group.events) {
        if (event.sport_key) keys.add(event.sport_key);
      }
    }
    return Array.from(keys);
  }, [groups]);

  // Live games only here, so no daysFrom — keeps quota down (these are in-play).
  const scores = useLiveScores(liveSportKeys, { enabled: liveCount > 0 });

  // Master market drives all events; per-event overrides are tracked separately.
  const [master, setMaster] = useState<MarketKey>('h2h');
  const [perEvent, setPerEvent] = useState<Record<string, MarketKey>>({});

  function handleMasterChange(market: MarketKey) {
    setMaster(market);
    setPerEvent({}); // clear overrides so every card follows the master
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sports', to: '/' }, { label: 'Live' }]} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="pill border-rose-400/30 bg-rose-500/15 text-rose-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              Live
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Live Sports
          </h1>
          <p className="text-sm text-slate-400">
            {loading
              ? 'Finding games in progress…'
              : `${liveCount} live ${liveCount === 1 ? 'game' : 'games'} across ${groups.length} ${groups.length === 1 ? 'sport' : 'sports'}`}
          </p>
        </div>
        {!loading && !error && liveCount > 0 && (
          <MarketSelect
            value={master}
            onChange={handleMasterChange}
            label="Market"
            size="md"
          />
        )}
      </div>

      {loading && <EventListSkeleton />}

      {error && (
        <ErrorView
          title="Couldn't load live games"
          message={`${error} The odds API may be rate-limited — try again shortly.`}
        />
      )}

      {!loading && !error && liveCount === 0 && (
        <ErrorView
          title="No games are live right now"
          message="There are no sports currently in progress with posted odds. Check back when games are underway, or browse upcoming matchups by sport."
        />
      )}

      {!loading && !error && liveCount > 0 && (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-slate-400">
                {group.title}
              </h2>
              <div className="space-y-5">
                {group.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    market={perEvent[event.id] ?? master}
                    onMarketChange={(m) =>
                      setPerEvent((prev) => ({ ...prev, [event.id]: m }))
                    }
                    score={scores.get(event.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

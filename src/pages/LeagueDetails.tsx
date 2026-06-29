import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllOdds } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import type { MarketKey, OddsEvent } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EventListSkeleton } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';
import { MarketSelect } from '../components/MarketSelect';
import { DateSelect, ALL_DAYS } from '../components/DateSelect';
import { EventCard } from '../components/EventCard';
import { dateKey } from '../lib/odds';

export function LeagueDetails() {
  // React Router already URL-decodes route params, so use `group` directly.
  const { group: groupName = '', leagueKey = '' } = useParams();

  const { data, loading, error } = useAsync(
    () => getAllOdds(leagueKey),
    [leagueKey],
  );

  const events = useMemo<OddsEvent[]>(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) =>
        new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime(),
    );
  }, [data]);

  const leagueTitle = events[0]?.sport_title ?? leagueKey;

  // Distinct local days that actually have events, in chronological order.
  // `events` is already sorted by commence_time, so first-seen order is sorted.
  const dates = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const event of events) {
      const key = dateKey(event.commence_time);
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(key);
      }
    }
    return ordered;
  }, [events]);

  // Master market drives all events; per-event overrides are tracked separately.
  const [master, setMaster] = useState<MarketKey>('h2h');
  const [perEvent, setPerEvent] = useState<Record<string, MarketKey>>({});

  // Selected local day, or ALL_DAYS to show everything.
  const [selectedDate, setSelectedDate] = useState<string>(ALL_DAYS);

  // Filter to the selected day (keeping the existing time-sort).
  const visibleEvents = useMemo<OddsEvent[]>(() => {
    if (selectedDate === ALL_DAYS) return events;
    return events.filter((e) => dateKey(e.commence_time) === selectedDate);
  }, [events, selectedDate]);

  // Reset per-event selections and date filter whenever a fresh league loads.
  useEffect(() => {
    setPerEvent({});
    setMaster('h2h');
    setSelectedDate(ALL_DAYS);
  }, [leagueKey]);

  function handleMasterChange(market: MarketKey) {
    setMaster(market);
    setPerEvent({}); // clear overrides so every card follows the master
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Sports', to: '/' },
          { label: groupName, to: `/sport/${encodeURIComponent(groupName)}` },
          { label: leagueTitle },
        ]}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {leagueTitle}
          </h1>
          <p className="text-sm text-slate-400">
            {loading
              ? 'Loading live lines…'
              : `${visibleEvents.length} upcoming ${visibleEvents.length === 1 ? 'matchup' : 'matchups'}`}
          </p>
        </div>
        {!loading && !error && events.length > 0 && (
          <div className="flex flex-wrap items-end gap-3">
            <DateSelect
              dates={dates}
              value={selectedDate}
              onChange={setSelectedDate}
              label="Date"
              size="md"
            />
            <MarketSelect
              value={master}
              onChange={handleMasterChange}
              label="Market"
              size="md"
            />
          </div>
        )}
      </div>

      {loading && <EventListSkeleton />}

      {error && (
        <ErrorView
          title="Couldn't load odds"
          message={`${error} The odds API may be rate-limited or this league may be out of season.`}
        />
      )}

      {!loading && !error && events.length === 0 && (
        <ErrorView
          title="No games scheduled"
          message="There are no upcoming events with posted odds for this league right now."
        />
      )}

      {!loading && !error && events.length > 0 && visibleEvents.length === 0 && (
        <ErrorView
          title="No games on this day"
          message="There are no events scheduled for the selected date. Try another day or pick “All days”."
        />
      )}

      {!loading && !error && visibleEvents.length > 0 && (
        <div className="space-y-5">
          {visibleEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              market={perEvent[event.id] ?? master}
              onMarketChange={(m) =>
                setPerEvent((prev) => ({ ...prev, [event.id]: m }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

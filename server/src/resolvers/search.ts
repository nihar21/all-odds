import { fuzzyScore } from '../lib/fuzzy.js';
import type { OddsApi } from '../datasources/oddsApi.js';
import type { RawOddsEvent, RawSport } from '../datasources/oddsApiTypes.js';
import { SearchCategory, type SearchHit } from '../generated/graphql.js';

const MAX_HITS_PER_CATEGORY = 6;

const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dateLabel(d: Date): string {
  return `${WEEKDAY_LONG[d.getUTCDay()].slice(0, 3)}, ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * Query terms a date can be matched against, including "today"/"tomorrow".
 * "today"/"tomorrow" are computed from UTC calendar days, not the searching
 * user's local day — the server has no client timezone context — so a US
 * evening game can occasionally be tagged "tomorrow" (or drop out of both)
 * right around the UTC-day rollover. The ISO/weekday/month-day terms below
 * are unaffected since they're derived straight from the event's own instant.
 */
function dateSearchTerms(d: Date, now: Date): string[] {
  const terms = [
    isoDate(d),
    WEEKDAY_LONG[d.getUTCDay()],
    `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`,
    `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
  ];
  const diffDays = Math.round((Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
  ) - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 86_400_000);
  if (diffDays === 0) terms.push('today');
  if (diffDays === 1) terms.push('tomorrow');
  return terms;
}

function bestScore(query: string, candidates: string[]): number | null {
  let best: number | null = null;
  for (const c of candidates) {
    const score = fuzzyScore(query, c);
    if (score !== null && (best === null || score > best)) best = score;
  }
  return best;
}

function topHits(hits: { hit: SearchHit; score: number }[]): SearchHit[] {
  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HITS_PER_CATEGORY)
    .map((h) => h.hit);
}

// Matches the upstream markets string `marketsToUpstream(DEFAULT_MARKETS)`
// produces in resolvers/index.ts (see mappers.ts) so this request shares the
// events resolver's TTL cache entry for the same "upcoming" window instead of
// fragmenting into a second real upstream request — search only reads team
// names/dates, not odds, so any markets value would work functionally.
const UPCOMING_MARKETS = 'h2h,spreads,totals';

/**
 * Builds the global-search result list for `query`: teams/dates from the
 * bounded "upcoming" event set (the same cross-sport window
 * `events(leagueKey: "upcoming")` already serves). Sports/leagues are matched
 * client-side instead (against the already-cached leagues list, see
 * `searchSportsAndLeagues` in the front-end's `src/lib/search.ts`), so this
 * resolver doesn't spend work on categories nothing here consumes.
 */
export async function search(query: string, oddsApi: OddsApi): Promise<SearchHit[]> {
  const [leaguesResult, eventsResult] = await Promise.allSettled([
    oddsApi.getLeagues(false),
    oddsApi.getEvents('upcoming', {
      regions: 'us',
      oddsFormat: 'american',
      markets: UPCOMING_MARKETS,
    }),
  ]);

  // Degrade gracefully: a failure fetching one (e.g. rate-limited) shouldn't
  // block results derived from the other.
  const leagues = leaguesResult.status === 'fulfilled' ? leaguesResult.value : [];
  const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];

  return [...searchTeams(query, events, leagues), ...searchDates(query, events)];
}

function searchTeams(query: string, events: RawOddsEvent[], leagues: RawSport[]): SearchHit[] {
  const groupByKey = new Map(leagues.map((l) => [l.key, l.group]));
  const seen = new Set<string>();
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const e of events) {
    for (const team of [e.home_team, e.away_team]) {
      if (!team) continue;
      // Dedupe per (team, league): the same name can legitimately appear in
      // more than one tracked league/competition within the bounded window.
      const dedupeKey = `${team}::${e.sport_key}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      const score = fuzzyScore(query, team);
      if (score === null) continue;
      scored.push({
        score,
        hit: {
          category: SearchCategory.Team,
          label: team,
          subtitle: e.sport_title,
          sportGroup: groupByKey.get(e.sport_key) ?? null,
          leagueKey: e.sport_key,
        },
      });
    }
  }
  return topHits(scored);
}

function searchDates(query: string, events: RawOddsEvent[]): SearchHit[] {
  const now = new Date();
  const byDate = new Map<string, Date[]>();
  for (const e of events) {
    const d = new Date(e.commence_time);
    if (Number.isNaN(d.getTime())) continue;
    const key = isoDate(d);
    const list = byDate.get(key) ?? [];
    list.push(d);
    byDate.set(key, list);
  }

  const scored: { hit: SearchHit; score: number }[] = [];
  for (const dates of byDate.values()) {
    const d = dates[0];
    const score = bestScore(query, dateSearchTerms(d, now));
    if (score === null) continue;
    scored.push({
      score,
      hit: {
        category: SearchCategory.Date,
        label: dateLabel(d),
        subtitle: `${dates.length} game${dates.length === 1 ? '' : 's'}`,
        sportGroup: null,
        leagueKey: null,
      },
    });
  }
  return topHits(scored);
}

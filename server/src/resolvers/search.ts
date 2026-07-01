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

/** Query terms a date can be matched against, including "today"/"tomorrow". */
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

/**
 * Builds the global-search result list for `query`: sports/leagues from the
 * full leagues list, teams/dates from the bounded "upcoming" event set (the
 * same cross-sport window `events(leagueKey: "upcoming")` already serves).
 */
export async function search(query: string, oddsApi: OddsApi): Promise<SearchHit[]> {
  const [leagues, events] = await Promise.all([
    oddsApi.getLeagues(false),
    oddsApi.getEvents('upcoming', {
      regions: 'us',
      oddsFormat: 'american',
      markets: 'h2h',
    }),
  ]);

  return [
    ...searchSports(query, leagues),
    ...searchLeagues(query, leagues),
    ...searchTeams(query, events, leagues),
    ...searchDates(query, events),
  ];
}

function searchSports(query: string, leagues: RawSport[]): SearchHit[] {
  const seen = new Set<string>();
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const l of leagues) {
    if (!l.group || seen.has(l.group)) continue;
    seen.add(l.group);
    const score = fuzzyScore(query, l.group);
    if (score === null) continue;
    scored.push({
      score,
      hit: {
        category: SearchCategory.Sport,
        label: l.group,
        subtitle: null,
        sportGroup: l.group,
        leagueKey: null,
      },
    });
  }
  return topHits(scored);
}

function searchLeagues(query: string, leagues: RawSport[]): SearchHit[] {
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const l of leagues) {
    const score = bestScore(query, [l.title, l.description]);
    if (score === null) continue;
    scored.push({
      score,
      hit: {
        category: SearchCategory.League,
        label: l.title,
        subtitle: l.group,
        sportGroup: l.group,
        leagueKey: l.key,
      },
    });
  }
  return topHits(scored);
}

function searchTeams(query: string, events: RawOddsEvent[], leagues: RawSport[]): SearchHit[] {
  const groupByKey = new Map(leagues.map((l) => [l.key, l.group]));
  const seen = new Set<string>();
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const e of events) {
    for (const team of [e.home_team, e.away_team]) {
      if (!team || seen.has(team)) continue;
      seen.add(team);
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

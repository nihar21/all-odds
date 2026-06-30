import type { OddsEvent, OddsFormat, Region, Sport } from '../types';

// The odds-API key is necessarily public in a client-only app. Allow overriding
// via a Vite env var, falling back to the project's existing key.
const API_KEY = import.meta.env.VITE_ODDS_API_KEY ?? 'b4bfd1cbef0039a797cf01b3b62bc2bc';
const BASE_URL = 'https://api.the-odds-api.com/v4';

// Simple in-memory request cache (mirrors the old Angular CacheService): the
// same URL won't be re-fetched within a session.
const cache = new Map<string, unknown>();

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function cachedGet<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }

  const res = await fetch(url);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ?? '';
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(
      detail || `Request failed with status ${res.status}`,
      res.status,
    );
  }

  const data = (await res.json()) as T;
  cache.set(url, data);
  return data;
}

export function getSportsList(): Promise<Sport[]> {
  return cachedGet<Sport[]>(`${BASE_URL}/sports/?apiKey=${API_KEY}`);
}

export function getAllOdds(
  sportKey: string,
  {
    regions = 'us',
    oddsFormat = 'american',
    // Comma-separated market keys. Defaults to the head-to-head game markets;
    // outright/futures sports (golf, politics, …) must pass `markets: 'outrights'`
    // since they don't offer h2h/spreads/totals.
    markets = 'h2h,spreads,totals',
  }: { regions?: Region; oddsFormat?: OddsFormat; markets?: string } = {},
): Promise<OddsEvent[]> {
  const url =
    `${BASE_URL}/sports/${sportKey}/odds/` +
    `?apiKey=${API_KEY}&regions=${regions}&oddsFormat=${oddsFormat}&markets=${markets}`;
  return cachedGet<OddsEvent[]>(url);
}

/**
 * Odds for games across every in-season sport, using the API's special
 * `upcoming` sport key. The response includes games currently in progress
 * (live) alongside the next ones to start, so callers can filter to whichever
 * subset they need (see `isLive`).
 *
 * Note: `upcoming` returns a bounded set rather than an exhaustive list, so a
 * live game in a less-popular sport may occasionally not appear. This is a
 * deliberate tradeoff — the complete alternative (querying every active sport)
 * would multiply API-credit usage. Results are also served from the session
 * cache in `cachedGet`, so see the caching note there for freshness behavior.
 */
export function getUpcomingOdds(
  opts: { regions?: Region; oddsFormat?: OddsFormat } = {},
): Promise<OddsEvent[]> {
  return getAllOdds('upcoming', opts);
}

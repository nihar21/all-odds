import { GraphQLError } from 'graphql';
import { config } from '../config.js';
import { TtlCache } from '../cache.js';
import type { RawOddsEvent, RawScoreEvent, RawSport } from './oddsApiTypes.js';

/**
 * Client for the-odds-api.com v4. Holds the API key server-side, caches
 * responses with per-endpoint TTLs, and translates upstream failures
 * (rate limits, quota exhaustion, auth) into typed GraphQL errors.
 */
export class OddsApi {
  constructor(private readonly cache = new TtlCache()) {}

  /** Sports/leagues list. `activeOnly` filters out out-of-season leagues. */
  async getLeagues(activeOnly: boolean): Promise<RawSport[]> {
    const all = await this.cache.getOrLoad('sports', config.cacheTtl.leagues, () =>
      this.get<RawSport[]>('/sports/'),
    );
    return activeOnly ? all.filter((s) => s.active) : all;
  }

  /** Odds events for a league key (`upcoming` is a valid cross-sport key). */
  getEvents(
    leagueKey: string,
    opts: { regions: string; oddsFormat: string; markets: string },
  ): Promise<RawOddsEvent[]> {
    const params = new URLSearchParams({
      regions: opts.regions,
      oddsFormat: opts.oddsFormat,
      markets: opts.markets,
    });
    const path = `/sports/${encodeURIComponent(leagueKey)}/odds/?${params}`;
    return this.cache.getOrLoad(`events:${path}`, config.cacheTtl.events, () =>
      this.get<RawOddsEvent[]>(path),
    );
  }

  /** Live + recently-completed scores for a concrete league key. */
  getScores(leagueKey: string, daysFrom?: number): Promise<RawScoreEvent[]> {
    const params = new URLSearchParams({ dateFormat: 'iso' });
    if (daysFrom !== undefined) params.set('daysFrom', String(daysFrom));
    const path = `/sports/${encodeURIComponent(leagueKey)}/scores/?${params}`;
    return this.cache.getOrLoad(`scores:${path}`, config.cacheTtl.scores, () =>
      this.get<RawScoreEvent[]>(path),
    );
  }

  /**
   * Issue a GET to the odds API, injecting the server-held key. Non-2xx
   * responses become `GraphQLError`s with a stable `code` extension the client
   * can branch on; the upstream remaining-quota header is surfaced for logging.
   */
  private async get<T>(path: string): Promise<T> {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${config.oddsApi.baseUrl}${path}${sep}apiKey=${config.oddsApi.apiKey}`;

    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new GraphQLError('Failed to reach the odds provider.', {
        extensions: { code: 'UPSTREAM_UNAVAILABLE', cause: String(err) },
      });
    }

    const remaining = res.headers.get('x-requests-remaining');
    if (remaining !== null) {
      console.log(`[odds-api] ${path} — requests remaining: ${remaining}`);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      if (res.status === 429) {
        throw new GraphQLError('Odds provider rate limit reached. Try again shortly.', {
          extensions: { code: 'RATE_LIMITED', upstreamStatus: 429 },
        });
      }
      if (res.status === 401 || res.status === 403) {
        throw new GraphQLError('Odds provider rejected the API key or quota is exhausted.', {
          extensions: { code: 'UPSTREAM_AUTH', upstreamStatus: res.status },
        });
      }
      throw new GraphQLError(detail || `Odds provider request failed (${res.status}).`, {
        extensions: { code: 'UPSTREAM_ERROR', upstreamStatus: res.status },
      });
    }

    return (await res.json()) as T;
  }
}

import { useEffect, useState } from 'react';
import { getScores } from '../lib/api';
import type { ScoreEvent } from '../types';

/** How often to refresh live scores. The-odds-api refreshes live scores about
 *  every 30s, so polling faster only burns quota without fresher data. */
const POLL_INTERVAL_MS = 30_000;

interface UseLiveScoresOptions {
  /** When false (or no keys), polling is disabled and the map stays empty. */
  enabled?: boolean;
  /** Include recently-completed games (1–3). Costs extra quota; lets finals show. */
  daysFrom?: number;
}

/**
 * Polls the the-odds-api `/scores` endpoint for one or more sport keys and
 * returns a `Map<eventId, ScoreEvent>` covering only games that already have
 * scores (live or completed). The map joins to displayed events by `event.id`.
 *
 * Scores are fetched via the UNCACHED `getScores` (the session cache has no TTL
 * and would freeze live scores), refreshing every ~30s while enabled. Callers
 * should enable this only when there's something live to watch, to conserve the
 * public API's limited quota.
 */
export function useLiveScores(
  sportKeys: string[],
  { enabled = true, daysFrom }: UseLiveScoresOptions = {},
): Map<string, ScoreEvent> {
  const [scores, setScores] = useState<Map<string, ScoreEvent>>(new Map());

  // Dedupe + sort into a stable string so the effect re-runs only when the set
  // of keys actually changes (not on every render with a fresh array).
  const keyList = Array.from(new Set(sportKeys)).sort();
  const keyDep = keyList.join(',');
  const active = enabled && keyList.length > 0;

  useEffect(() => {
    if (!active) {
      setScores(new Map());
      return;
    }

    let cancelled = false;

    const load = async () => {
      const results = await Promise.allSettled(
        keyList.map((key) => getScores(key, { daysFrom })),
      );
      if (cancelled) return;

      const next = new Map<string, ScoreEvent>();
      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        for (const game of result.value) {
          // Only games that have started have a non-empty scores array.
          if (game.scores && game.scores.length > 0) next.set(game.id, game);
        }
      }
      setScores(next);
    };

    void load();
    const interval = setInterval(() => void load(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDep, active, daysFrom]);

  return scores;
}

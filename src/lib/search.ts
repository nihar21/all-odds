import type { Sport } from '../types';
import { apolloClient } from './graphql/client';
import { SearchDocument } from './graphql/generated';

export type SearchCategory = 'SPORT' | 'LEAGUE' | 'TEAM' | 'DATE';

/** A single global-search result the top-bar search palette can navigate to. */
export interface SearchHit {
  category: SearchCategory;
  label: string;
  subtitle?: string | null;
  sportGroup?: string | null;
  leagueKey?: string | null;
}

const MAX_HITS_PER_CATEGORY = 6;

// Small, dependency-free fuzzy matcher (mirrors `server/src/lib/fuzzy.ts` —
// the two packages don't share code, and this is small enough to duplicate).
// Handles substring matches, out-of-order multi-word queries ("prem leag" ->
// "Premier League"), and single-token typos ("lakerz" -> "Lakers").

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

/**
 * Score how well `query` fuzzy-matches `target`; null means no match. Every
 * whitespace-separated query token must match somewhere in `target`.
 */
export function fuzzyScore(query: string, target: string): number | null {
  const q = normalize(query);
  const t = normalize(target);
  if (!q) return null;

  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;

  const qTokens = q.split(/\s+/).filter(Boolean);
  const tTokens = t.split(/\s+/).filter(Boolean);

  let tokenScore = 0;
  for (const qt of qTokens) {
    let best = 0;
    for (const tt of tTokens) {
      if (tt === qt) best = Math.max(best, 70);
      else if (tt.startsWith(qt)) best = Math.max(best, 60);
      else if (tt.includes(qt)) best = Math.max(best, 45);
      else {
        const dist = levenshtein(qt, tt);
        const maxLen = Math.max(qt.length, tt.length);
        // Require at least 6 characters before tolerating a 1-edit typo —
        // shorter tokens (e.g. "jets"/"Nets", "rays"/"Rams") are too close
        // together in edit-distance terms for a 1-edit match to be meaningful.
        if (maxLen >= 6 && dist <= Math.max(1, Math.floor(maxLen / 4))) {
          best = Math.max(best, 40 - dist * 5);
        }
      }
    }
    if (best === 0) return null;
    tokenScore += best;
  }

  return tokenScore / qTokens.length;
}

/**
 * Client-side fuzzy pass over the already-cached sports/leagues list, so
 * those two categories show instant results without a round trip — teams and
 * dates always come from the backend `search` query (see `searchViaGraphql`),
 * since they require the bounded "upcoming" event set the client doesn't have.
 */
export function searchSportsAndLeagues(sports: Sport[], query: string): SearchHit[] {
  if (!query.trim()) return [];

  const seenGroups = new Set<string>();
  const sportHits: { hit: SearchHit; score: number }[] = [];
  const leagueHits: { hit: SearchHit; score: number }[] = [];

  for (const s of sports) {
    if (s.group && !seenGroups.has(s.group)) {
      seenGroups.add(s.group);
      const score = fuzzyScore(query, s.group);
      if (score !== null) {
        sportHits.push({
          score,
          hit: { category: 'SPORT', label: s.group, sportGroup: s.group },
        });
      }
    }

    const leagueScore = Math.max(
      fuzzyScore(query, s.title) ?? -1,
      fuzzyScore(query, s.description) ?? -1,
    );
    if (leagueScore >= 0) {
      leagueHits.push({
        score: leagueScore,
        hit: {
          category: 'LEAGUE',
          label: s.title,
          subtitle: s.group,
          sportGroup: s.group,
          leagueKey: s.key,
        },
      });
    }
  }

  const byScore = (a: { score: number }, b: { score: number }) => b.score - a.score;
  return [
    ...sportHits.sort(byScore).slice(0, MAX_HITS_PER_CATEGORY).map((h) => h.hit),
    ...leagueHits.sort(byScore).slice(0, MAX_HITS_PER_CATEGORY).map((h) => h.hit),
  ];
}

/** Teams/dates search via the GraphQL backend's bounded "upcoming" event set. */
export async function searchTeamsAndDatesViaGraphql(query: string): Promise<SearchHit[]> {
  const { data } = await apolloClient.query({
    query: SearchDocument,
    variables: { query },
    fetchPolicy: 'no-cache',
  });

  return data.search
    .filter((hit) => hit.category === 'TEAM' || hit.category === 'DATE')
    .map((hit) => ({
      category: hit.category as SearchCategory,
      label: hit.label,
      subtitle: hit.subtitle,
      sportGroup: hit.sportGroup,
      leagueKey: hit.leagueKey,
    }));
}

/** Route to navigate to when a search hit is selected, or null if there isn't one. */
export function hitHref(hit: SearchHit): string | null {
  if (hit.category === 'SPORT' && hit.sportGroup) {
    return `/sport/${encodeURIComponent(hit.sportGroup)}`;
  }
  if ((hit.category === 'LEAGUE' || hit.category === 'TEAM') && hit.sportGroup && hit.leagueKey) {
    return `/sport/${encodeURIComponent(hit.sportGroup)}/league/${encodeURIComponent(hit.leagueKey)}`;
  }
  if (hit.category === 'DATE') {
    // A date can span multiple leagues in the bounded "upcoming" set; the
    // cross-sport live/upcoming view is the closest existing destination
    // until a dedicated day view lands (see #15).
    return '/live';
  }
  return null;
}

// Small, dependency-free fuzzy matcher shared by the search resolver. Handles
// whole/partial substring matches, out-of-order multi-word queries ("prem
// leag" -> "Premier League"), and single-token typos ("lakerz" -> "Lakers")
// without pulling in a fuzzy-search library for one resolver.

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
 * Score how well `query` fuzzy-matches `target`; null means no match.
 * Higher is better. Every whitespace-separated query token must match
 * somewhere in `target` for a token-level match to count.
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

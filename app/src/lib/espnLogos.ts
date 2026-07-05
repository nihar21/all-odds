// Runtime fallback for teams missing from the bundled manifest
// (src/data/teamLogos.json, populated by scripts/fetch-logos.mjs). When the
// build couldn't reach ESPN (or a team was added since the manifest was last
// generated), fetch the league's team list directly from the browser and
// hot-link the logo. Unlike the build-time pipeline this does hit ESPN at
// request time, but only as a last resort, and results are cached in-memory
// for the session so each league is only fetched once.
import { normalizeTeam } from './logos';

// the-odds-api sport_key -> ESPN {sport}/{league}. Kept in sync with
// scripts/fetch-logos.mjs's LEAGUE_SLUGS.
const LEAGUE_SLUGS: Record<string, string> = {
  americanfootball_nfl: 'football/nfl',
  americanfootball_ncaaf: 'football/college-football',
  basketball_nba: 'basketball/nba',
  basketball_wnba: 'basketball/wnba',
  basketball_ncaab: 'basketball/mens-college-basketball',
  baseball_mlb: 'baseball/mlb',
  icehockey_nhl: 'hockey/nhl',
  soccer_epl: 'soccer/eng.1',
  soccer_usa_mls: 'soccer/usa.1',
  soccer_spain_la_liga: 'soccer/esp.1',
  soccer_germany_bundesliga: 'soccer/ger.1',
  soccer_italy_serie_a: 'soccer/ita.1',
  soccer_france_ligue_one: 'soccer/fra.1',
  soccer_uefa_champs_league: 'soccer/uefa.champions',
};

/** normalized team name -> ESPN logo URL, per sport_key. */
const leagueCache = new Map<string, Promise<Record<string, string>>>();

async function fetchLeagueLogos(slug: string): Promise<Record<string, string>> {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${slug}/teams`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  const teams = data?.sports?.[0]?.leagues?.[0]?.teams ?? [];

  const manifest: Record<string, string> = {};
  for (const entry of teams) {
    const team = entry?.team;
    const logoHref = team?.logos?.[0]?.href;
    if (!team || !logoHref) continue;

    const keys = [
      team.displayName,
      team.location && team.name ? `${team.location} ${team.name}` : null,
      team.shortDisplayName,
      team.name,
      team.nickname,
      team.abbreviation,
    ].filter(Boolean);

    for (const key of keys) {
      const norm = normalizeTeam(key);
      if (norm && !manifest[norm]) manifest[norm] = logoHref;
    }
  }
  return manifest;
}

/**
 * Resolves a team's logo via ESPN at runtime, for use only when the bundled
 * manifest has no entry. Returns null (never throws) when the sport isn't
 * supported, the request fails, or no team matches — callers should fall
 * back to the placeholder in that case.
 */
export async function fetchEspnLogo(
  sportKey: string | undefined,
  team: string,
): Promise<string | null> {
  if (!sportKey) return null;
  const slug = LEAGUE_SLUGS[sportKey];
  if (!slug) return null;

  let pending = leagueCache.get(sportKey);
  if (!pending) {
    pending = fetchLeagueLogos(slug).catch(() => ({}));
    leagueCache.set(sportKey, pending);
  }

  const manifest = await pending;
  return manifest[normalizeTeam(team)] ?? null;
}

// Build-time generator: fetches team logos from ESPN's free public API and
// bundles them on our side so the app never hot-links ESPN at runtime.
//
//   node scripts/fetch-logos.mjs
//
// For each supported league it queries
//   https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams
// downloads each team's default logo PNG into public/logos/<league>/<slug>.png
// and writes src/data/teamLogos.json mapping normalized team names -> public path.
//
// ESPN's API is undocumented and may change or omit teams; this script degrades
// gracefully (a failed league or team is skipped, never fatal) so a partial run
// still produces a usable manifest.

import { mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOGOS_DIR = resolve(ROOT, 'public/logos');
const MANIFEST_PATH = resolve(ROOT, 'src/data/teamLogos.json');

// the-odds-api sport_key -> ESPN {sport}/{league}
const LEAGUE_SLUGS = {
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

/**
 * Normalize a team name for matching: lowercase, strip diacritics &
 * punctuation, collapse whitespace. Kept in sync with src/lib/logos.ts.
 */
function normalizeTeam(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Turn a team display name into a filesystem-safe slug. */
function slugify(name) {
  return normalizeTeam(name).replace(/\s+/g, '-') || 'team';
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'all-odds-logo-fetcher' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function downloadTo(url, filePath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'all-odds-logo-fetcher' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, buf);
}

async function run() {
  // Start fresh so removed teams don't leave stale files behind, but preserve
  // the committed placeholder.svg (the runtime fallback) which lives here too.
  await mkdir(LOGOS_DIR, { recursive: true });
  for (const entry of await readdir(LOGOS_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === 'placeholder.svg') continue;
    await rm(resolve(LOGOS_DIR, entry.name), { recursive: true, force: true });
  }

  /** normalized name -> public path */
  const manifest = {};
  let teamCount = 0;

  for (const [sportKey, slug] of Object.entries(LEAGUE_SLUGS)) {
    const league = sportKey; // use the-odds-api key as the folder name
    const url = `https://site.api.espn.com/apis/site/v2/sports/${slug}/teams`;
    let data;
    try {
      data = await fetchJson(url);
    } catch (err) {
      console.warn(`[skip league] ${sportKey} (${slug}): ${err.message}`);
      continue;
    }

    // ESPN nests teams under sports[0].leagues[0].teams[].team
    const teams = data?.sports?.[0]?.leagues?.[0]?.teams ?? [];
    let leagueCount = 0;

    for (const entry of teams) {
      const team = entry?.team;
      if (!team) continue;

      const logoHref = team.logos?.[0]?.href;
      const displayName = team.displayName;
      if (!logoHref || !displayName) continue;

      const slugName = slugify(displayName);
      const relPath = `/logos/${league}/${slugName}.png`;
      const filePath = resolve(ROOT, `public/logos/${league}/${slugName}.png`);

      try {
        await downloadTo(logoHref, filePath);
      } catch (err) {
        console.warn(`[skip team] ${displayName}: ${err.message}`);
        continue;
      }

      // Index under several normalized keys to maximize matches against
      // the-odds-api names. Earlier (more specific) keys win on conflict.
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
        if (norm && !manifest[norm]) manifest[norm] = relPath;
      }

      leagueCount++;
      teamCount++;
    }

    console.log(`${sportKey} (${slug}): ${leagueCount} teams`);
  }

  // Sort keys for a stable, diff-friendly manifest.
  const sorted = {};
  for (const k of Object.keys(manifest).sort()) sorted[k] = manifest[k];

  await mkdir(dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');

  console.log(
    `\nWrote ${Object.keys(sorted).length} keys for ${teamCount} teams -> ${MANIFEST_PATH}`,
  );
}

run().catch((err) => {
  console.error('fetch-logos failed:', err);
  process.exit(1);
});

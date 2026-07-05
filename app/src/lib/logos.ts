import teamLogos from '../data/teamLogos.json';

/** Bundled neutral placeholder used whenever a team logo is unavailable. */
export const PLACEHOLDER_LOGO = '/logos/placeholder.svg';

const LOGO_MAP: Record<string, string> = teamLogos;

/**
 * Normalize a team name for matching: lowercase, strip diacritics &
 * punctuation, collapse whitespace. Kept in sync with scripts/fetch-logos.mjs
 * so manifest keys and the-odds-api names line up.
 */
export function normalizeTeam(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Resolve a team name to a bundled logo path, falling back to the neutral
 * placeholder for undefined or unmatched teams. Never throws.
 */
export function logoFor(team?: string): string {
  if (!team) return PLACEHOLDER_LOGO;
  const key = normalizeTeam(team);
  if (!key) return PLACEHOLDER_LOGO;
  return LOGO_MAP[key] ?? PLACEHOLDER_LOGO;
}

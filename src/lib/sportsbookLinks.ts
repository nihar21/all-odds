// Per-event/per-market deep links require a partnership/affiliate agreement
// with each sportsbook that we don't have, so this maps a bookmaker key to its
// public web URL only. Opening that URL covers the desktop case directly and,
// for sportsbooks that have configured iOS Universal Links / Android App
// Links for their domain (most major ones have), it also satisfies the mobile
// "open the native app if installed, otherwise fall back to the site" case —
// the OS handles that redirect for us, no custom URL-scheme guessing needed.
export const SPORTSBOOK_URLS: Record<string, string> = {
  fanduel: 'https://sportsbook.fanduel.com',
  draftkings: 'https://sportsbook.draftkings.com',
  betmgm: 'https://sports.betmgm.com',
  williamhill_us: 'https://www.caesars.com/sportsbook-and-casino',
  pointsbetus: 'https://pointsbet.com',
  betrivers: 'https://www.betrivers.com',
  superbook: 'https://www.superbook.com',
  unibet_us: 'https://unibet.com',
  twinspires: 'https://www.twinspires.com',
  barstool: 'https://www.espnbet.com',
  betus: 'https://www.betus.com.pa',
  bovada: 'https://www.bovada.lv',
  betonlineag: 'https://www.betonline.ag',
  lowvig: 'https://www.lowvig.ag',
  mybookieag: 'https://www.mybookie.ag',
};

export function sportsbookUrl(bookKey: string): string | null {
  return SPORTSBOOK_URLS[bookKey] ?? null;
}

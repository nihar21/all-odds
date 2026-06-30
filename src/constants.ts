import type { BookmakerInfo, MarketKey } from './types';

// Markets offered by the game-odds picker. `outrights` is intentionally
// excluded — it has no head-to-head counterpart and renders via OutrightCard.
export const MARKET_KEYS: MarketKey[] = ['h2h', 'spreads', 'totals'];

export const MARKET_LABELS: Record<MarketKey, string> = {
  h2h: 'Moneyline',
  spreads: 'Spread',
  totals: 'Total (O/U)',
  outrights: 'Winner',
};

export const MARKET_DESCRIPTIONS: Record<MarketKey, string> = {
  h2h: 'Pick the outright winner.',
  spreads: 'Bet against the point spread.',
  totals: 'Bet the combined score over or under.',
  outrights: 'Bet the outright tournament or event winner.',
};

// Preferred ordering + display titles for sportsbooks. Columns are derived from
// the books actually present in an event, ordered by this list.
export const BOOKMAKERS: BookmakerInfo[] = [
  { key: 'fanduel', title: 'FanDuel', url: 'https://sportsbook.fanduel.com' },
  { key: 'draftkings', title: 'DraftKings', url: 'https://sportsbook.draftkings.com' },
  { key: 'betmgm', title: 'BetMGM', url: 'https://sports.betmgm.com' },
  { key: 'williamhill_us', title: 'Caesars', url: 'https://www.caesars.com/sportsbook-and-casino' },
  { key: 'pointsbetus', title: 'PointsBet', url: 'https://pointsbet.com' },
  { key: 'betrivers', title: 'BetRivers', url: 'https://www.betrivers.com' },
  { key: 'superbook', title: 'SuperBook', url: 'https://www.superbook.com' },
  { key: 'unibet_us', title: 'Unibet', url: 'https://unibet.com' },
  { key: 'twinspires', title: 'TwinSpires', url: 'https://www.twinspires.com' },
  { key: 'barstool', title: 'Barstool', url: 'https://www.espnbet.com' },
  { key: 'betus', title: 'BetUS', url: 'https://www.betus.com.pa' },
  { key: 'bovada', title: 'Bovada', url: 'https://www.bovada.lv' },
  { key: 'betonlineag', title: 'BetOnline.ag', url: 'https://www.betonline.ag' },
  { key: 'lowvig', title: 'LowVig.ag', url: 'https://www.lowvig.ag' },
  { key: 'mybookieag', title: 'MyBookie.ag', url: 'https://www.mybookie.ag' },
];

export const BOOKMAKER_TITLES: Record<string, string> = Object.fromEntries(
  BOOKMAKERS.map((b) => [b.key, b.title]),
);

// Maps the-odds-api "group" names to an emoji used on sport cards.
export const SPORT_ICONS: Record<string, string> = {
  'American Football': '🏈',
  Baseball: '⚾',
  Basketball: '🏀',
  'Boxing': '🥊',
  'Mixed Martial Arts': '🥋',
  'Ice Hockey': '🏒',
  Soccer: '⚽',
  Golf: '⛳',
  Tennis: '🎾',
  'Aussie Rules': '🏉',
  'Rugby League': '🏉',
  Cricket: '🏏',
  Lacrosse: '🥍',
  Politics: '🗳️',
};

export function sportIcon(group: string): string {
  return SPORT_ICONS[group] ?? '🎯';
}

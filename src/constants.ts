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
  { key: 'fanduel', title: 'FanDuel' },
  { key: 'draftkings', title: 'DraftKings' },
  { key: 'betmgm', title: 'BetMGM' },
  { key: 'williamhill_us', title: 'Caesars' },
  { key: 'pointsbetus', title: 'PointsBet' },
  { key: 'betrivers', title: 'BetRivers' },
  { key: 'superbook', title: 'SuperBook' },
  { key: 'unibet_us', title: 'Unibet' },
  { key: 'twinspires', title: 'TwinSpires' },
  { key: 'barstool', title: 'Barstool' },
  { key: 'betus', title: 'BetUS' },
  { key: 'bovada', title: 'Bovada' },
  { key: 'betonlineag', title: 'BetOnline.ag' },
  { key: 'lowvig', title: 'LowVig.ag' },
  { key: 'mybookieag', title: 'MyBookie.ag' },
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

import type { BookmakerInfo, MarketKey } from './types';
import type { OddsFormat } from './lib/odds';

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
  { key: 'fanduel', title: 'FanDuel', url: 'https://sportsbook.fanduel.com', logo: '/logos/books/fanduel.svg' },
  { key: 'draftkings', title: 'DraftKings', url: 'https://sportsbook.draftkings.com', logo: '/logos/books/draftkings.svg' },
  { key: 'betmgm', title: 'BetMGM', url: 'https://sports.betmgm.com', logo: '/logos/books/betmgm.svg' },
  { key: 'williamhill_us', title: 'Caesars', url: 'https://www.caesars.com/sportsbook-and-casino', logo: '/logos/books/williamhill_us.svg' },
  { key: 'pointsbetus', title: 'PointsBet', url: 'https://pointsbet.com', logo: '/logos/books/pointsbetus.svg' },
  { key: 'betrivers', title: 'BetRivers', url: 'https://www.betrivers.com', logo: '/logos/books/betrivers.svg' },
  { key: 'superbook', title: 'SuperBook', url: 'https://www.superbook.com', logo: '/logos/books/superbook.svg' },
  { key: 'unibet_us', title: 'Unibet', url: 'https://unibet.com', logo: '/logos/books/unibet_us.svg' },
  { key: 'twinspires', title: 'TwinSpires', url: 'https://www.twinspires.com', logo: '/logos/books/twinspires.svg' },
  { key: 'barstool', title: 'Barstool', url: 'https://www.espnbet.com', logo: '/logos/books/barstool.svg' },
  { key: 'betus', title: 'BetUS', url: 'https://www.betus.com.pa', logo: '/logos/books/betus.svg' },
  { key: 'bovada', title: 'Bovada', url: 'https://www.bovada.lv', logo: '/logos/books/bovada.svg' },
  { key: 'betonlineag', title: 'BetOnline.ag', url: 'https://www.betonline.ag', logo: '/logos/books/betonlineag.svg' },
  { key: 'lowvig', title: 'LowVig.ag', url: 'https://www.lowvig.ag', logo: '/logos/books/lowvig.svg' },
  { key: 'mybookieag', title: 'MyBookie.ag', url: 'https://www.mybookie.ag', logo: '/logos/books/mybookieag.svg' },
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

// User-selectable odds display formats, offered in this order on the Settings page.
export const ODDS_FORMATS: OddsFormat[] = ['american', 'decimal', 'percent'];

export const ODDS_FORMAT_LABELS: Record<OddsFormat, string> = {
  american: 'American',
  decimal: 'Decimal',
  percent: 'Implied %',
};

export const ODDS_FORMAT_DESCRIPTIONS: Record<OddsFormat, string> = {
  american: 'e.g. +150, -110',
  decimal: 'e.g. 2.50, 1.91',
  percent: 'e.g. 40%, 52%',
};

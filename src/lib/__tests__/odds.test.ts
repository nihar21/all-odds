import { describe, expect, it } from 'vitest';
import type { OddsEvent } from '../../types';
import {
  bestBooksForRow,
  bookColumns,
  dateKey,
  decimalOdds,
  drawOutcomeName,
  formatDateLabel,
  formatGameTime,
  formatOdds,
  formatPoint,
  formatPrice,
  getOutcome,
  impliedProbability,
  isLive,
  marketSummary,
  outrightRows,
  rowsForMarket,
  sectionsByDate,
  sectionsByTime,
  slugify,
  timeKey,
} from '../odds';

function makeEvent(overrides: Partial<OddsEvent> = {}): OddsEvent {
  return {
    id: 'evt-1',
    sport_key: 'americanfootball_nfl',
    sport_title: 'NFL',
    commence_time: '2026-01-01T18:00:00Z',
    home_team: 'Home Team',
    away_team: 'Away Team',
    bookmakers: [],
    ...overrides,
  };
}

describe('formatPrice', () => {
  it('prefixes positive prices with a plus sign', () => {
    expect(formatPrice(150)).toBe('+150');
  });

  it('leaves negative prices as-is', () => {
    expect(formatPrice(-110)).toBe('-110');
  });

  it('renders an em dash for missing prices', () => {
    expect(formatPrice(null)).toBe('—');
    expect(formatPrice(undefined)).toBe('—');
    expect(formatPrice(NaN)).toBe('—');
  });
});

describe('formatPoint', () => {
  it('prefixes positive points with a plus sign', () => {
    expect(formatPoint(3.5)).toBe('+3.5');
  });

  it('leaves negative points as-is', () => {
    expect(formatPoint(-7)).toBe('-7');
  });

  it('renders an empty string for missing points', () => {
    expect(formatPoint(null)).toBe('');
    expect(formatPoint(undefined)).toBe('');
  });
});

describe('decimalOdds', () => {
  it('converts a positive American price to decimal odds', () => {
    expect(decimalOdds(150)).toBeCloseTo(2.5);
  });

  it('converts a negative American price to decimal odds', () => {
    expect(decimalOdds(-200)).toBeCloseTo(1.5);
  });
});

describe('impliedProbability', () => {
  it('converts a positive American price to implied probability', () => {
    expect(impliedProbability(150)).toBeCloseTo(0.4);
  });

  it('converts a negative American price to implied probability', () => {
    expect(impliedProbability(-200)).toBeCloseTo(2 / 3);
  });
});

describe('formatOdds', () => {
  it('defaults to American formatting', () => {
    expect(formatOdds(150)).toBe('+150');
    expect(formatOdds(-110)).toBe('-110');
  });

  it('formats decimal odds to two decimal places', () => {
    expect(formatOdds(150, 'decimal')).toBe('2.50');
    expect(formatOdds(-200, 'decimal')).toBe('1.50');
  });

  it('formats implied probability as a rounded percentage', () => {
    expect(formatOdds(150, 'percent')).toBe('40%');
    expect(formatOdds(-200, 'percent')).toBe('67%');
  });

  it('renders an em dash for missing prices in every format', () => {
    expect(formatOdds(null, 'decimal')).toBe('—');
    expect(formatOdds(undefined, 'percent')).toBe('—');
    expect(formatOdds(NaN, 'american')).toBe('—');
  });
});

describe('bookColumns', () => {
  it('orders known books by the preferred BOOKMAKERS list', () => {
    const event = makeEvent({
      bookmakers: [
        { key: 'betmgm', title: 'BetMGM', last_update: '', markets: [] },
        { key: 'fanduel', title: 'FanDuel', last_update: '', markets: [] },
        { key: 'draftkings', title: 'DraftKings', last_update: '', markets: [] },
      ],
    });
    expect(bookColumns(event).map((c) => c.key)).toEqual([
      'fanduel',
      'draftkings',
      'betmgm',
    ]);
  });

  it('appends unknown books after the preferred ones', () => {
    const event = makeEvent({
      bookmakers: [
        { key: 'fanduel', title: 'FanDuel', last_update: '', markets: [] },
        { key: 'some_new_book', title: 'Some New Book', last_update: '', markets: [] },
      ],
    });
    expect(bookColumns(event).map((c) => c.key)).toEqual(['fanduel', 'some_new_book']);
  });
});

describe('getOutcome', () => {
  it('finds the matching outcome by book, market, and name', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            { key: 'h2h', last_update: '', outcomes: [{ name: 'Home Team', price: -120 }] },
          ],
        },
      ],
    });
    expect(getOutcome(event, 'fanduel', 'h2h', 'Home Team')?.price).toBe(-120);
    expect(getOutcome(event, 'fanduel', 'h2h', 'Nope')).toBeUndefined();
    expect(getOutcome(event, 'missing_book', 'h2h', 'Home Team')).toBeUndefined();
  });
});

describe('drawOutcomeName', () => {
  it('returns null when no book has a draw outcome', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            {
              key: 'h2h',
              last_update: '',
              outcomes: [
                { name: 'Home Team', price: -120 },
                { name: 'Away Team', price: 110 },
              ],
            },
          ],
        },
      ],
    });
    expect(drawOutcomeName(event)).toBeNull();
  });

  it('returns the draw outcome name (case-insensitive "Draw"/"Tie")', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            {
              key: 'h2h',
              last_update: '',
              outcomes: [
                { name: 'Home Team', price: -120 },
                { name: 'Away Team', price: 280 },
                { name: 'Tie', price: 240 },
              ],
            },
          ],
        },
      ],
    });
    expect(drawOutcomeName(event)).toBe('Tie');
  });
});

describe('outrightRows', () => {
  it('ranks competitors by their best (highest) price across books, favorite first', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            {
              key: 'outrights',
              last_update: '',
              outcomes: [
                { name: 'Longshot', price: 6000 },
                { name: 'Favorite', price: -150 },
              ],
            },
          ],
        },
        {
          key: 'draftkings',
          title: 'DraftKings',
          last_update: '',
          markets: [
            {
              key: 'outrights',
              last_update: '',
              outcomes: [{ name: 'Favorite', price: -200 }],
            },
          ],
        },
      ],
    });
    expect(outrightRows(event).map((r) => r.outcomeName)).toEqual(['Favorite', 'Longshot']);
  });
});

describe('rowsForMarket', () => {
  it('builds totals rows for Over/Under', () => {
    const rows = rowsForMarket(makeEvent(), 'totals');
    expect(rows.map((r) => r.outcomeName)).toEqual(['Over', 'Under']);
  });

  it('builds h2h rows as away/home with no draw for a 2-way sport', () => {
    const rows = rowsForMarket(makeEvent(), 'h2h');
    expect(rows.map((r) => r.label)).toEqual(['Away Team', 'Home Team']);
  });

  it('inserts a Draw row between away and home for 3-way soccer matchups', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            {
              key: 'h2h',
              last_update: '',
              outcomes: [
                { name: 'Away Team', price: 250 },
                { name: 'Draw', price: 220 },
                { name: 'Home Team', price: -110 },
              ],
            },
          ],
        },
      ],
    });
    expect(rowsForMarket(event, 'h2h').map((r) => r.label)).toEqual([
      'Away Team',
      'Draw',
      'Home Team',
    ]);
  });

  it('builds spreads rows as away/home', () => {
    const rows = rowsForMarket(makeEvent(), 'spreads');
    expect(rows.map((r) => r.label)).toEqual(['Away Team', 'Home Team']);
  });
});

describe('bestBooksForRow', () => {
  const columns = [
    { key: 'fanduel', title: 'FanDuel' },
    { key: 'draftkings', title: 'DraftKings' },
    { key: 'betmgm', title: 'BetMGM' },
  ];

  it('picks the single highest American price for moneyline', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [{ key: 'h2h', last_update: '', outcomes: [{ name: 'Home Team', price: -110 }] }],
        },
        {
          key: 'draftkings',
          title: 'DraftKings',
          last_update: '',
          markets: [{ key: 'h2h', last_update: '', outcomes: [{ name: 'Home Team', price: -105 }] }],
        },
      ],
    });
    expect(bestBooksForRow(event, 'h2h', 'Home Team', columns)).toEqual(new Set(['draftkings']));
  });

  it('only compares spread prices among books sharing the modal line', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            { key: 'spreads', last_update: '', outcomes: [{ name: 'Home Team', price: -105, point: -3 }] },
          ],
        },
        {
          key: 'draftkings',
          title: 'DraftKings',
          last_update: '',
          markets: [
            { key: 'spreads', last_update: '', outcomes: [{ name: 'Home Team', price: -110, point: -3 }] },
          ],
        },
        {
          key: 'betmgm',
          title: 'BetMGM',
          last_update: '',
          markets: [
            // Off-market line with a better price; should not win since it's not on the modal line.
            { key: 'spreads', last_update: '', outcomes: [{ name: 'Home Team', price: 100, point: -3.5 }] },
          ],
        },
      ],
    });
    expect(bestBooksForRow(event, 'spreads', 'Home Team', columns)).toEqual(new Set(['fanduel']));
  });

  it('returns an empty set when no book offers the outcome', () => {
    const event = makeEvent();
    expect(bestBooksForRow(event, 'h2h', 'Home Team', columns)).toEqual(new Set());
  });
});

describe('marketSummary', () => {
  it('summarizes the favorite spread', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            {
              key: 'spreads',
              last_update: '',
              outcomes: [
                { name: 'Home Team', price: -110, point: -3.5 },
                { name: 'Away Team', price: -110, point: 3.5 },
              ],
            },
          ],
        },
      ],
    });
    expect(marketSummary(event, 'spreads')).toBe('Home Team -3.5');
  });

  it("falls back to Pick 'em when no favorite has a negative point", () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [{ key: 'spreads', last_update: '', outcomes: [] }],
        },
      ],
    });
    expect(marketSummary(event, 'spreads')).toBe("Pick 'em");
  });

  it('summarizes the total as O/U <point>', () => {
    const event = makeEvent({
      bookmakers: [
        {
          key: 'fanduel',
          title: 'FanDuel',
          last_update: '',
          markets: [
            { key: 'totals', last_update: '', outcomes: [{ name: 'Over', price: -110, point: 45.5 }] },
          ],
        },
      ],
    });
    expect(marketSummary(event, 'totals')).toBe('O/U 45.5');
  });

  it('returns null when the event has no bookmakers', () => {
    expect(marketSummary(makeEvent(), 'spreads')).toBeNull();
  });
});

describe('formatGameTime / isLive', () => {
  it('formats an ISO timestamp into a day and time', () => {
    const { day, time } = formatGameTime('2026-01-01T18:00:00Z');
    // Locale/timezone-dependent, so assert shape rather than exact text: this
    // still catches a day/time field swap or a broken Date (e.g. "Invalid Date").
    expect(day).toMatch(/^[A-Za-z]{3},\s[A-Za-z]{3}\s\d{1,2}$/);
    expect(time).toMatch(/^\d{1,2}:\d{2}\s?[AP]M$/i);
  });

  it('treats past timestamps as live and future ones as not live', () => {
    expect(isLive('2000-01-01T00:00:00Z')).toBe(true);
    expect(isLive('2999-01-01T00:00:00Z')).toBe(false);
  });
});

// Computed independently of `dateKey` so these tests can actually catch a bug
// in `dateKey` itself, rather than the bug cancelling out on both sides.
function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

describe('dateKey / formatDateLabel', () => {
  it('formats an ISO timestamp as a local YYYY-MM-DD key', () => {
    expect(dateKey('2026-03-15T12:00:00Z')).toBe(
      localDateKey(new Date('2026-03-15T12:00:00Z')),
    );
  });

  it('labels today as "Today"', () => {
    const todayKey = localDateKey(new Date());
    expect(formatDateLabel(todayKey)).toBe('Today');
  });

  it('labels tomorrow as "Tomorrow"', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = localDateKey(tomorrow);
    expect(formatDateLabel(tomorrowKey)).toBe('Tomorrow');
  });

  it('labels other days with a short weekday/date string', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const futureKey = localDateKey(future);
    const label = formatDateLabel(futureKey);
    expect(label).not.toBe('Today');
    expect(label).not.toBe('Tomorrow');
    expect(label.length).toBeGreaterThan(0);
  });
});

describe('sectionsByDate', () => {
  it('groups events by local day, in first-seen (chronological) order', () => {
    const events = [
      makeEvent({ id: 'a', commence_time: '2026-03-15T18:00:00Z' }),
      makeEvent({ id: 'b', commence_time: '2026-03-16T18:00:00Z' }),
      makeEvent({ id: 'c', commence_time: '2026-03-15T20:00:00Z' }),
    ];
    const sections = sectionsByDate(events);
    expect(sections).toHaveLength(2);
    expect(sections[0].events.map((e) => e.id)).toEqual(['a', 'c']);
    expect(sections[1].events.map((e) => e.id)).toEqual(['b']);
  });

  it('produces distinct, colon-free ids per day and reuses formatDateLabel for the label', () => {
    const key = localDateKey(new Date());
    const events = [makeEvent({ id: 'a', commence_time: new Date().toISOString() })];
    const sections = sectionsByDate(events);
    expect(sections[0].id).toBe(`date-${key}`);
    expect(sections[0].id).not.toContain(':');
    expect(sections[0].label).toBe(formatDateLabel(key));
  });
});

describe('timeKey', () => {
  it('formats a local HH:mm key from an ISO timestamp', () => {
    const date = new Date('2026-03-15T18:00:00Z');
    const expected = `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}`;
    expect(timeKey('2026-03-15T18:00:00Z')).toBe(expected);
  });
});

describe('sectionsByTime', () => {
  it('groups events by exact local start time, in first-seen order', () => {
    const events = [
      makeEvent({ id: 'a', commence_time: '2026-03-15T18:00:00Z' }),
      makeEvent({ id: 'b', commence_time: '2026-03-15T20:00:00Z' }),
      makeEvent({ id: 'c', commence_time: '2026-03-15T18:00:00Z' }),
    ];
    const sections = sectionsByTime(events);
    expect(sections).toHaveLength(2);
    expect(sections[0].events.map((e) => e.id)).toEqual(['a', 'c']);
    expect(sections[1].events.map((e) => e.id)).toEqual(['b']);
  });

  it('produces colon-free ids', () => {
    const sections = sectionsByTime([
      makeEvent({ id: 'a', commence_time: '2026-03-15T18:00:00Z' }),
    ]);
    expect(sections[0].id).not.toContain(':');
  });

  it("labels each section using formatGameTime's time portion for its first event", () => {
    const sections = sectionsByTime([
      makeEvent({ id: 'a', commence_time: '2026-03-15T18:00:00Z' }),
    ]);
    expect(sections[0].label).toBe(formatGameTime('2026-03-15T18:00:00Z').time);
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates non-alphanumeric runs', () => {
    expect(slugify('NBA Basketball')).toBe('nba-basketball');
    expect(slugify("Women's World Cup")).toBe('women-s-world-cup');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  MLB!  ')).toBe('mlb');
  });
});

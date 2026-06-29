import type { MarketKey, OddsEvent, Outcome } from '../types';
import { BOOKMAKERS, BOOKMAKER_TITLES } from '../constants';

/** Format an American price: +150, -110, or an em dash when missing. */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || Number.isNaN(price)) return '—';
  return price > 0 ? `+${price}` : `${price}`;
}

/** Format a spread/total point with an explicit sign (e.g. +3.5, -7, 45.5). */
export function formatPoint(point: number | null | undefined): string {
  if (point === null || point === undefined || Number.isNaN(point)) return '';
  return point > 0 ? `+${point}` : `${point}`;
}

/** A bookmaker column actually present in the event, in our preferred order. */
export interface BookColumn {
  key: string;
  title: string;
}

export function bookColumns(event: OddsEvent): BookColumn[] {
  const present = new Set(event.bookmakers.map((b) => b.key));
  const ordered = BOOKMAKERS.filter((b) => present.has(b.key)).map((b) => ({
    key: b.key,
    title: b.title,
  }));
  // Include any books returned by the API that aren't in our preferred list.
  const known = new Set(ordered.map((b) => b.key));
  for (const b of event.bookmakers) {
    if (!known.has(b.key)) {
      ordered.push({ key: b.key, title: BOOKMAKER_TITLES[b.key] ?? b.title });
    }
  }
  return ordered;
}

/** Look up a single outcome for a given book + market + outcome name. */
export function getOutcome(
  event: OddsEvent,
  bookKey: string,
  marketKey: MarketKey,
  outcomeName: string,
): Outcome | undefined {
  const book = event.bookmakers.find((b) => b.key === bookKey);
  const market = book?.markets.find((m) => m.key === marketKey);
  return market?.outcomes.find((o) => o.name === outcomeName);
}

/** A logical row in the odds table (one selectable outcome across all books). */
export interface OddsRow {
  /** Outcome name as it appears in the API (team name, or "Over"/"Under"). */
  outcomeName: string;
  /** Human label shown in the first column. */
  label: string;
  /** Optional sub-label (e.g. team city / "combined points"). */
  sublabel?: string;
}

/**
 * Soccer (and other "3-way" sports) include a draw as a third h2h outcome named
 * "Draw" (occasionally "Tie"). Returns the outcome name as it appears in the
 * data, or null when the matchup has no draw line (e.g. NFL, NBA).
 */
export function drawOutcomeName(event: OddsEvent): string | null {
  for (const book of event.bookmakers) {
    const h2h = book.markets.find((m) => m.key === 'h2h');
    const draw = h2h?.outcomes.find((o) => {
      const n = o.name.toLowerCase();
      return n === 'draw' || n === 'tie';
    });
    if (draw) return draw.name;
  }
  return null;
}

export function rowsForMarket(event: OddsEvent, market: MarketKey): OddsRow[] {
  const away = event.away_team ?? 'Away';
  const home = event.home_team ?? 'Home';

  if (market === 'totals') {
    return [
      { outcomeName: 'Over', label: 'Over', sublabel: 'Combined points' },
      { outcomeName: 'Under', label: 'Under', sublabel: 'Combined points' },
    ];
  }

  // Moneyline: home/away, plus a Draw row for 3-way (soccer) matchups.
  if (market === 'h2h') {
    const rows: OddsRow[] = [{ outcomeName: away, label: away, sublabel: 'Away' }];
    const draw = drawOutcomeName(event);
    if (draw) {
      rows.push({ outcomeName: draw, label: 'Draw', sublabel: 'Tie' });
    }
    rows.push({ outcomeName: home, label: home, sublabel: 'Home' });
    return rows;
  }

  // Spreads (incl. soccer handicaps) remain a two-way away/home structure.
  return [
    { outcomeName: away, label: away, sublabel: 'Away' },
    { outcomeName: home, label: home, sublabel: 'Home' },
  ];
}

interface PriceCell {
  key: string;
  price: number;
  point?: number;
}

/** The point value posted by the most sportsbooks for a row (the modal line). */
function modalPoint(cells: PriceCell[]): number | undefined {
  const counts = new Map<number, number>();
  for (const c of cells) {
    if (c.point === undefined) continue;
    counts.set(c.point, (counts.get(c.point) ?? 0) + 1);
  }
  let modal: number | undefined;
  let modalCount = 0;
  for (const [point, count] of counts) {
    if (count > modalCount) {
      modalCount = count;
      modal = point;
    }
  }
  return modal;
}

/**
 * Returns the set of book keys offering the best (most favorable to the bettor)
 * price for a row, for highlighting. A higher American price always pays more
 * (+150 > +120, -110 > -120).
 *
 * For spreads/totals each book may post a different line (`point`), so comparing
 * price alone is apples-to-oranges. We therefore compare prices only among books
 * sharing the most common line; books on a different line are not highlighted.
 */
export function bestBooksForRow(
  event: OddsEvent,
  market: MarketKey,
  outcomeName: string,
  columns: BookColumn[],
): Set<string> {
  const cells = columns
    .map((col): PriceCell | null => {
      const outcome = getOutcome(event, col.key, market, outcomeName);
      return outcome
        ? { key: col.key, price: outcome.price, point: outcome.point }
        : null;
    })
    .filter((c): c is PriceCell => c !== null);

  const winners = new Set<string>();
  if (cells.length === 0) return winners;

  // Moneyline has no line to reconcile; otherwise restrict to the modal line.
  let eligible = cells;
  if (market !== 'h2h') {
    const line = modalPoint(cells);
    if (line !== undefined) {
      eligible = cells.filter((c) => c.point === line);
    }
  }

  const best = Math.max(...eligible.map((c) => c.price));
  for (const c of eligible) {
    if (c.price === best) winners.add(c.key);
  }
  return winners;
}

/** Headline line for an event under a market (favorite spread / total / pick'em). */
export function marketSummary(event: OddsEvent, market: MarketKey): string | null {
  const cols = bookColumns(event);
  if (cols.length === 0) return null;

  if (market === 'spreads') {
    for (const col of cols) {
      const book = event.bookmakers.find((b) => b.key === col.key);
      const spreads = book?.markets.find((m) => m.key === 'spreads');
      const fav = spreads?.outcomes.find((o) => (o.point ?? 0) < 0);
      if (fav) return `${fav.name} ${formatPoint(fav.point)}`;
    }
    return "Pick 'em";
  }

  if (market === 'totals') {
    for (const col of cols) {
      const book = event.bookmakers.find((b) => b.key === col.key);
      const totals = book?.markets.find((m) => m.key === 'totals');
      const point = totals?.outcomes[0]?.point;
      if (point !== undefined) return `O/U ${point}`;
    }
    return null;
  }

  return null;
}

export function formatGameTime(iso: string): { day: string; time: string } {
  const date = new Date(iso);
  const day = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return { day, time };
}

export function isLive(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}

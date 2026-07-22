// Read-only client for Kalshi's public market-data API — spike PoC for #31.
//
// Reading market data (events/markets/orderbook) is public and unauthenticated;
// no API key is needed. See https://trading-api.readme.io/reference for the
// full reference. Authenticated endpoints (placing/tracking trades) are out of
// scope for this spike.
const KALSHI_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

/**
 * A market as normalized for use in this module: `last_price`/`yes_bid`/
 * `yes_ask`/`no_bid`/`no_ask` are cents integers (0-99), which is what
 * `centsToProbability`/`centsToAmericanOdds`/`centsToDecimalOdds` and the
 * preview table expect. See `KalshiMarketRaw` for the wire shape this is
 * derived from.
 */
export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle?: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  status: string;
  close_time: string;
}

/**
 * The shape Kalshi's live `/markets` endpoint actually returns: prices are
 * fixed-point decimal-dollar strings (e.g. `"0.63"` for 63 cents), not cents
 * integers. See https://trading-api.readme.io/reference/getmarkets.
 */
interface KalshiMarketRaw {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle?: string;
  yes_bid_dollars: string;
  yes_ask_dollars: string;
  no_bid_dollars: string;
  no_ask_dollars: string;
  last_price_dollars: string;
  status: string;
  close_time: string;
}

interface KalshiMarketsResponse {
  markets: KalshiMarketRaw[];
  cursor?: string;
}

/** Parse a Kalshi fixed-point decimal-dollar string (e.g. `"0.63"`) to a cents integer (0-99). */
function dollarsToCents(dollars: string): number {
  return Math.round(parseFloat(dollars) * 100);
}

function normalizeMarket(raw: KalshiMarketRaw): KalshiMarket {
  return {
    ticker: raw.ticker,
    event_ticker: raw.event_ticker,
    title: raw.title,
    subtitle: raw.subtitle,
    yes_bid: dollarsToCents(raw.yes_bid_dollars),
    yes_ask: dollarsToCents(raw.yes_ask_dollars),
    no_bid: dollarsToCents(raw.no_bid_dollars),
    no_ask: dollarsToCents(raw.no_ask_dollars),
    last_price: dollarsToCents(raw.last_price_dollars),
    status: raw.status,
    close_time: raw.close_time,
  };
}

export class KalshiApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'KalshiApiError';
  }
}

// Simple in-memory request cache, mirroring `cachedGet` in lib/api.ts: the
// same URL won't be re-fetched within a session (e.g. resubmitting the same
// series-ticker filter on the preview page).
const cache = new Map<string, KalshiMarket[]>();

/**
 * Open markets from Kalshi's public `/markets` endpoint. Optionally scoped to
 * one series (e.g. a sports series ticker) via `seriesTicker`; omit it to get
 * the first page of all open markets across Kalshi.
 */
export async function getKalshiMarkets({
  seriesTicker,
  limit = 25,
}: { seriesTicker?: string; limit?: number } = {}): Promise<KalshiMarket[]> {
  const params = new URLSearchParams({ status: 'open', limit: String(limit) });
  if (seriesTicker) params.set('series_ticker', seriesTicker);
  const url = `${KALSHI_BASE_URL}/markets?${params}`;

  if (cache.has(url)) {
    return cache.get(url)!;
  }

  const res = await fetch(url);
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ?? '';
    } catch {
      /* ignore parse errors */
    }
    throw new KalshiApiError(
      detail || `Request failed with status ${res.status}`,
      res.status,
    );
  }

  const body = (await res.json()) as KalshiMarketsResponse;
  const markets = body.markets.map(normalizeMarket);
  cache.set(url, markets);
  return markets;
}

/** A Kalshi "Yes" price in cents (1-99) as an implied probability (0-1). */
export function centsToProbability(cents: number): number {
  return cents / 100;
}

/**
 * Convert a Kalshi "Yes" price (cents, i.e. implied probability) to American
 * odds, so it can sit alongside sportsbook moneylines. Standard
 * probability-to-American conversion: favorites (p >= 0.5) get negative odds,
 * underdogs positive. Returns null at the 0%/100% extremes, where American
 * odds are undefined.
 */
export function centsToAmericanOdds(cents: number): number | null {
  const p = centsToProbability(cents);
  if (p <= 0 || p >= 1) return null;
  return p >= 0.5 ? Math.round((-100 * p) / (1 - p)) : Math.round((100 * (1 - p)) / p);
}

/**
 * Convert a Kalshi "Yes" price (cents) to decimal odds (1 / probability).
 * Returns null at 0%, where decimal odds are undefined.
 */
export function centsToDecimalOdds(cents: number): number | null {
  const p = centsToProbability(cents);
  if (p <= 0) return null;
  return Math.round((1 / p) * 100) / 100;
}

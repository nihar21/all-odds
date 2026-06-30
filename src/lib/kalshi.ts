// Read-only client for Kalshi's public market-data API — spike PoC for #31.
//
// Reading market data (events/markets/orderbook) is public and unauthenticated;
// no API key is needed. See https://trading-api.readme.io/reference for the
// full reference. Authenticated endpoints (placing/tracking trades) are out of
// scope for this spike.
const KALSHI_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

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

interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor?: string;
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

  const res = await fetch(`${KALSHI_BASE_URL}/markets?${params}`);
  if (!res.ok) {
    throw new KalshiApiError(`Request failed with status ${res.status}`, res.status);
  }
  const body = (await res.json()) as KalshiMarketsResponse;
  return body.markets;
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

// Data shapes mirror the-odds-api.com v4 responses.

export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
}

export interface Market {
  key: MarketKey;
  last_update: string;
  outcomes: Outcome[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team?: string;
  away_team?: string;
  has_outrights?: boolean;
  bookmakers: Bookmaker[];
}

// Game markets are h2h/spreads/totals; `outrights` is the futures/"winner"
// market used by tournament & event-winner sports (golf, politics, …), which
// have no home/away teams — just a field of competitors. See OutrightCard.
export type MarketKey = 'h2h' | 'spreads' | 'totals' | 'outrights';

export type Region = 'uk' | 'us' | 'us2' | 'eu' | 'au';
export type OddsFormat = 'decimal' | 'american';

export interface BookmakerInfo {
  key: string;
  title: string;
}

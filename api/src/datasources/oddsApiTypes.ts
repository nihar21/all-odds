// Raw the-odds-api.com v4 response shapes. These mirror the front-end's
// `src/types/index.ts`; resolvers normalize them into the GraphQL schema so the
// client only ever sees the schema's camelCased domain types.

export interface RawSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

export interface RawOutcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
}

export interface RawMarket {
  key: string;
  last_update: string;
  outcomes: RawOutcome[];
}

export interface RawBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: RawMarket[];
}

export interface RawOddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team?: string;
  away_team?: string;
  has_outrights?: boolean;
  bookmakers: RawBookmaker[];
}

export interface RawScoreEntry {
  name: string;
  score: string;
}

export interface RawScoreEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team?: string;
  away_team?: string;
  scores: RawScoreEntry[] | null;
  last_update: string | null;
}

import { MarketKey, OddsFormat, Region } from '../generated/graphql.js';
import type {
  RawBookmaker,
  RawMarket,
  RawOddsEvent,
  RawOutcome,
  RawScoreEvent,
  RawSport,
} from '../datasources/oddsApiTypes.js';
import type {
  Bookmaker as GqlBookmaker,
  Event as GqlEvent,
  League as GqlLeague,
  LiveScore as GqlLiveScore,
  Market as GqlMarket,
  Outcome as GqlOutcome,
} from '../generated/graphql.js';

// The odds API speaks lowercase strings; the schema exposes uppercase enums.
// These maps are the single place that bridges the two casings.

const marketToUpstream: Record<MarketKey, string> = {
  [MarketKey.H2H]: 'h2h',
  [MarketKey.Spreads]: 'spreads',
  [MarketKey.Totals]: 'totals',
  [MarketKey.Outrights]: 'outrights',
};

const marketFromUpstream: Record<string, MarketKey> = {
  h2h: MarketKey.H2H,
  spreads: MarketKey.Spreads,
  totals: MarketKey.Totals,
  outrights: MarketKey.Outrights,
};

export const regionToUpstream: Record<Region, string> = {
  [Region.Uk]: 'uk',
  [Region.Us]: 'us',
  [Region.Us2]: 'us2',
  [Region.Eu]: 'eu',
  [Region.Au]: 'au',
};

export const oddsFormatToUpstream: Record<OddsFormat, string> = {
  [OddsFormat.Decimal]: 'decimal',
  [OddsFormat.American]: 'american',
};

export const marketsToUpstream = (markets: MarketKey[]): string =>
  markets.map((m) => marketToUpstream[m]).join(',');

export const mapLeague = (s: RawSport): GqlLeague => ({
  key: s.key,
  group: s.group,
  title: s.title,
  description: s.description,
  active: s.active,
  hasOutrights: s.has_outrights,
});

const mapOutcome = (o: RawOutcome): GqlOutcome => ({
  name: o.name,
  price: o.price,
  point: o.point ?? null,
  description: o.description ?? null,
});

const mapMarket = (m: RawMarket): GqlMarket => ({
  // Unknown markets fall back to OUTRIGHTS rather than crashing the whole query.
  key: marketFromUpstream[m.key] ?? MarketKey.Outrights,
  lastUpdate: m.last_update,
  outcomes: m.outcomes.map(mapOutcome),
});

const mapBookmaker = (b: RawBookmaker): GqlBookmaker => ({
  key: b.key,
  title: b.title,
  lastUpdate: b.last_update,
  markets: b.markets.map(mapMarket),
});

export const mapEvent = (e: RawOddsEvent): GqlEvent => ({
  id: e.id,
  leagueKey: e.sport_key,
  leagueTitle: e.sport_title,
  commenceTime: e.commence_time,
  home: e.home_team ? { name: e.home_team, logoUrl: null } : null,
  away: e.away_team ? { name: e.away_team, logoUrl: null } : null,
  hasOutrights: e.has_outrights ?? false,
  bookmakers: e.bookmakers.map(mapBookmaker),
});

export const mapLiveScore = (s: RawScoreEvent): GqlLiveScore => ({
  id: s.id,
  leagueKey: s.sport_key,
  leagueTitle: s.sport_title,
  commenceTime: s.commence_time,
  completed: s.completed,
  home: s.home_team ? { name: s.home_team, logoUrl: null } : null,
  away: s.away_team ? { name: s.away_team, logoUrl: null } : null,
  scores: (s.scores ?? []).map((entry) => ({ name: entry.name, score: entry.score })),
  lastUpdate: s.last_update,
});

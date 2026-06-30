import { MarketKey, OddsFormat, Region, type Resolvers } from '../generated/graphql.js';
import {
  mapEvent,
  mapLeague,
  mapLiveScore,
  marketsToUpstream,
  oddsFormatToUpstream,
  regionToUpstream,
} from './mappers.js';

const DEFAULT_MARKETS = [MarketKey.H2H, MarketKey.Spreads, MarketKey.Totals];

/**
 * Query resolvers fully normalize upstream responses into schema types, so the
 * nested object/field resolvers fall through to the default field resolver.
 */
export const resolvers: Resolvers = {
  Query: {
    leagues: async (_parent, { activeOnly }, { oddsApi }) => {
      const sports = await oddsApi.getLeagues(activeOnly ?? false);
      return sports.map(mapLeague);
    },

    league: async (_parent, { key }, { oddsApi }) => {
      const sports = await oddsApi.getLeagues(false);
      const match = sports.find((s) => s.key === key);
      return match ? mapLeague(match) : null;
    },

    events: async (_parent, { leagueKey, regions, oddsFormat, markets }, { oddsApi }) => {
      const events = await oddsApi.getEvents(leagueKey, {
        regions: regionToUpstream[regions ?? Region.Us],
        oddsFormat: oddsFormatToUpstream[oddsFormat ?? OddsFormat.American],
        markets: marketsToUpstream(markets ?? DEFAULT_MARKETS),
      });
      return events.map(mapEvent);
    },

    liveScores: async (_parent, { leagueKey, daysFrom }, { oddsApi }) => {
      const scores = await oddsApi.getScores(leagueKey, daysFrom ?? undefined);
      return scores.map(mapLiveScore);
    },
  },
};

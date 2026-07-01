import { OddsApi } from './datasources/oddsApi.js';

/**
 * Per-process context handed to every resolver. The `OddsApi` instance owns the
 * shared TTL cache, so it is created once and reused across requests (cache hits
 * span clients, not just a single operation).
 */
export interface GraphQLContext {
  oddsApi: OddsApi;
}

const oddsApi = new OddsApi();

export function createContext(): GraphQLContext {
  return { oddsApi };
}

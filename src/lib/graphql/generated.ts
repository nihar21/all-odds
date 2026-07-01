import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Bookmaker = {
  __typename?: 'Bookmaker';
  key: Scalars['String']['output'];
  lastUpdate: Scalars['String']['output'];
  markets: Array<Market>;
  title: Scalars['String']['output'];
};

/** A single matchup with bookmaker odds. */
export type Event = {
  __typename?: 'Event';
  away?: Maybe<Team>;
  bookmakers: Array<Bookmaker>;
  commenceTime: Scalars['String']['output'];
  hasOutrights: Scalars['Boolean']['output'];
  home?: Maybe<Team>;
  id: Scalars['ID']['output'];
  leagueKey: Scalars['ID']['output'];
  leagueTitle: Scalars['String']['output'];
};

/** A sport/league offered by the odds provider (e.g. NBA, EPL). */
export type League = {
  __typename?: 'League';
  active: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  group: Scalars['String']['output'];
  hasOutrights: Scalars['Boolean']['output'];
  key: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

/** Live or final score for an event. `id` matches the corresponding Event.id. */
export type LiveScore = {
  __typename?: 'LiveScore';
  away?: Maybe<Team>;
  commenceTime: Scalars['String']['output'];
  completed: Scalars['Boolean']['output'];
  home?: Maybe<Team>;
  id: Scalars['ID']['output'];
  lastUpdate?: Maybe<Scalars['String']['output']>;
  leagueKey: Scalars['ID']['output'];
  leagueTitle: Scalars['String']['output'];
  scores: Array<ScoreEntry>;
};

export type Market = {
  __typename?: 'Market';
  key: MarketKey;
  lastUpdate: Scalars['String']['output'];
  outcomes: Array<Outcome>;
};

export enum MarketKey {
  H2H = 'H2H',
  Outrights = 'OUTRIGHTS',
  Spreads = 'SPREADS',
  Totals = 'TOTALS'
}

export enum OddsFormat {
  American = 'AMERICAN',
  Decimal = 'DECIMAL'
}

export type Outcome = {
  __typename?: 'Outcome';
  /** Competitor name for outright/futures markets. */
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** Spread/total line, when applicable. */
  point?: Maybe<Scalars['Float']['output']>;
  /** Price in the requested odds format (American by default). */
  price: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * Odds events for a league. Pass the special key \"upcoming\" for a bounded
   * cross-sport set of live + next-to-start games.
   */
  events: Array<Event>;
  /** A single league by its provider key (e.g. "basketball_nba"), or null if unknown. */
  league?: Maybe<League>;
  /** All sports/leagues known to the upstream provider (active and inactive). */
  leagues: Array<League>;
  /** Live + recently-completed scores for a league (one concrete league key; not "upcoming"). */
  liveScores: Array<LiveScore>;
  /**
   * Fuzzy, typo-tolerant search across sports, leagues, teams, and upcoming-game
   * dates for the top bar's global search. Teams and dates are drawn from the
   * bounded \"upcoming\" event set (see `events`), not an exhaustive per-league
   * scan, so a team/date with no game in that window won't surface.
   */
  search: Array<SearchHit>;
};


export type QueryEventsArgs = {
  leagueKey: Scalars['ID']['input'];
  markets?: InputMaybe<Array<MarketKey>>;
  oddsFormat?: InputMaybe<OddsFormat>;
  regions?: InputMaybe<Region>;
};


export type QueryLeagueArgs = {
  key: Scalars['ID']['input'];
};


export type QueryLeaguesArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryLiveScoresArgs = {
  daysFrom?: InputMaybe<Scalars['Int']['input']>;
  leagueKey: Scalars['ID']['input'];
};


export type QuerySearchArgs = {
  query: Scalars['String']['input'];
};

export enum Region {
  Au = 'AU',
  Eu = 'EU',
  Uk = 'UK',
  Us = 'US',
  Us2 = 'US2'
}

export type ScoreEntry = {
  __typename?: 'ScoreEntry';
  name: Scalars['String']['output'];
  score: Scalars['String']['output'];
};

/** One of the four global-search result categories. */
export enum SearchCategory {
  Date = 'DATE',
  League = 'LEAGUE',
  Sport = 'SPORT',
  Team = 'TEAM'
}

/** A single fuzzy-matched global-search result the client can navigate to. */
export type SearchHit = {
  __typename?: 'SearchHit';
  category: SearchCategory;
  /** Display label (a sport/league name, a team, or a formatted date). */
  label: Scalars['String']['output'];
  /** League key, to build the `/sport/:group/league/:leagueKey` route. */
  leagueKey?: Maybe<Scalars['ID']['output']>;
  /**
   * Sport group, to build the `/sport/:group` route. Null for a DATE hit that
   * spans multiple leagues.
   */
  sportGroup?: Maybe<Scalars['String']['output']>;
  /** Secondary text shown under the label (e.g. a team's league). */
  subtitle?: Maybe<Scalars['String']['output']>;
};

/** A team participating in an event. Logo enrichment (ESPN) is planned — see #16. */
export type Team = {
  __typename?: 'Team';
  /** Absolute URL to the team's logo, when known. Null until logo enrichment lands. */
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type LeaguesQueryVariables = Exact<{
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type LeaguesQuery = { __typename?: 'Query', leagues: Array<{ __typename?: 'League', key: string, group: string, title: string, description: string, active: boolean, hasOutrights: boolean }> };

export type SearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchQuery = { __typename?: 'Query', search: Array<{ __typename?: 'SearchHit', category: SearchCategory, label: string, subtitle?: string | null, sportGroup?: string | null, leagueKey?: string | null }> };


export const LeaguesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Leagues"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leagues"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"hasOutrights"}}]}}]}}]} as unknown as DocumentNode<LeaguesQuery, LeaguesQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"sportGroup"}},{"kind":"Field","name":{"kind":"Name","value":"leagueKey"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
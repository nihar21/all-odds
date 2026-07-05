import { GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Bookmaker: ResolverTypeWrapper<Bookmaker>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Event: ResolverTypeWrapper<Event>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  League: ResolverTypeWrapper<League>;
  LiveScore: ResolverTypeWrapper<LiveScore>;
  Market: ResolverTypeWrapper<Market>;
  MarketKey: MarketKey;
  OddsFormat: OddsFormat;
  Outcome: ResolverTypeWrapper<Outcome>;
  Query: ResolverTypeWrapper<{}>;
  Region: Region;
  ScoreEntry: ResolverTypeWrapper<ScoreEntry>;
  SearchCategory: SearchCategory;
  SearchHit: ResolverTypeWrapper<SearchHit>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Team: ResolverTypeWrapper<Team>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Bookmaker: Bookmaker;
  Boolean: Scalars['Boolean']['output'];
  Event: Event;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  League: League;
  LiveScore: LiveScore;
  Market: Market;
  Outcome: Outcome;
  Query: {};
  ScoreEntry: ScoreEntry;
  SearchHit: SearchHit;
  String: Scalars['String']['output'];
  Team: Team;
}>;

export type BookmakerResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Bookmaker'] = ResolversParentTypes['Bookmaker']> = ResolversObject<{
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  markets?: Resolver<Array<ResolversTypes['Market']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  away?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  bookmakers?: Resolver<Array<ResolversTypes['Bookmaker']>, ParentType, ContextType>;
  commenceTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasOutrights?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  home?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  leagueKey?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  leagueTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LeagueResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['League'] = ResolversParentTypes['League']> = ResolversObject<{
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasOutrights?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LiveScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LiveScore'] = ResolversParentTypes['LiveScore']> = ResolversObject<{
  away?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  commenceTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  home?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  leagueKey?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  leagueTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scores?: Resolver<Array<ResolversTypes['ScoreEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Market'] = ResolversParentTypes['Market']> = ResolversObject<{
  key?: Resolver<ResolversTypes['MarketKey'], ParentType, ContextType>;
  lastUpdate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  outcomes?: Resolver<Array<ResolversTypes['Outcome']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OutcomeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Outcome'] = ResolversParentTypes['Outcome']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  point?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'leagueKey' | 'markets' | 'oddsFormat' | 'regions'>>;
  league?: Resolver<Maybe<ResolversTypes['League']>, ParentType, ContextType, RequireFields<QueryLeagueArgs, 'key'>>;
  leagues?: Resolver<Array<ResolversTypes['League']>, ParentType, ContextType, RequireFields<QueryLeaguesArgs, 'activeOnly'>>;
  liveScores?: Resolver<Array<ResolversTypes['LiveScore']>, ParentType, ContextType, RequireFields<QueryLiveScoresArgs, 'leagueKey'>>;
  search?: Resolver<Array<ResolversTypes['SearchHit']>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'query'>>;
}>;

export type ScoreEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ScoreEntry'] = ResolversParentTypes['ScoreEntry']> = ResolversObject<{
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  score?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SearchHitResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SearchHit'] = ResolversParentTypes['SearchHit']> = ResolversObject<{
  category?: Resolver<ResolversTypes['SearchCategory'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  leagueKey?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  sportGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = ResolversObject<{
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Bookmaker?: BookmakerResolvers<ContextType>;
  Event?: EventResolvers<ContextType>;
  League?: LeagueResolvers<ContextType>;
  LiveScore?: LiveScoreResolvers<ContextType>;
  Market?: MarketResolvers<ContextType>;
  Outcome?: OutcomeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ScoreEntry?: ScoreEntryResolvers<ContextType>;
  SearchHit?: SearchHitResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
}>;


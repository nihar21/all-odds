import type { Sport } from '../../types';
import { apolloClient } from './client';
import { LeaguesDocument } from './generated';

/**
 * Fetch the sports/leagues list via the GraphQL backend and map it back to the
 * front-end's `Sport` shape, so callers (e.g. `getSportsList`) are agnostic to
 * whether the data came from GraphQL or the direct the-odds-api path.
 */
export async function getLeaguesViaGraphql(activeOnly = false): Promise<Sport[]> {
  const { data } = await apolloClient.query({
    query: LeaguesDocument,
    variables: { activeOnly },
  });

  return data.leagues.map((l) => ({
    key: l.key,
    group: l.group,
    title: l.title,
    description: l.description,
    active: l.active,
    has_outrights: l.hasOutrights,
  }));
}

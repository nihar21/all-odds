import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

/**
 * GraphQL endpoint for the AllOdds backend (see `/server`). When unset, the app
 * keeps talking to the-odds-api directly (the client-only default), so the
 * deployed Firebase build is unaffected until a backend URL is configured.
 */
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined;

/** True when a backend is configured and feature loaders should prefer it. */
export const BACKEND_ENABLED = Boolean(GRAPHQL_URL);

/**
 * Shared Apollo Client. The app is always wrapped in `<ApolloProvider>` so
 * components can use hooks once more features move server-side; today the
 * vertical slice (leagues list) uses it imperatively via `client.query`.
 * Points at a placeholder path when no backend is configured — it is simply
 * never queried in that case.
 */
export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL ?? '/graphql' }),
  cache: new InMemoryCache(),
});

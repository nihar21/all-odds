# AllOdds GraphQL backend

A standalone **Node.js + TypeScript + Apollo Server** service that is the single
typed API surface for the AllOdds front-end. It proxies and normalizes upstream
data sources (today: [the-odds-api.com](https://the-odds-api.com/); planned:
ESPN team/logos — #16, and historical/opening-closing odds — #13) so the client
never calls third-party APIs or holds their keys.

This package is intentionally separate from the front-end app in `../app`
(its own `package.json`), so the existing Firebase Hosting build is unaffected.

## Why a backend

- **Centralized data fetching** behind one typed contract.
- **Secrets off the client** — third-party keys live in server env, not the bundle.
- **Server-side caching + rate-limit handling** for upstream APIs.
- A **schema-first GraphQL contract** with codegen shared by FE and BE.

## Stack

- Apollo Server 5 (`startStandaloneServer`).
- Schema-first SDL (`src/schema.graphql`) — the single source of truth, also
  consumed by both codegen configs (this package and the root app).
- Typed resolvers generated via `@graphql-codegen/typescript-resolvers`.

## Layout

```
api/
  src/
    index.ts                # Apollo standalone bootstrap (loads SDL at runtime)
    schema.graphql          # GraphQL contract (source of truth)
    config.ts               # env-driven config (API key, cache TTLs, port)
    context.ts              # per-request context (shared OddsApi instance)
    env.ts                  # loads api/.env before config is read
    cache.ts                # TTL cache w/ single-flight de-duplication
    datasources/
      oddsApi.ts            # the-odds-api client: caching + rate-limit -> typed errors
      oddsApiTypes.ts       # raw upstream response shapes
    resolvers/
      index.ts              # Query resolvers (normalize upstream -> schema)
      mappers.ts            # upstream<->schema mapping incl. enum casing
    generated/graphql.ts    # codegen output (committed)
  codegen.ts                # resolver-type codegen config
```

## GraphQL API

```graphql
leagues(activeOnly: Boolean = false): [League!]!
league(key: ID!): League
events(leagueKey: ID!, regions: Region = US, oddsFormat: OddsFormat = AMERICAN,
       markets: [MarketKey!] = [H2H, SPREADS, TOTALS]): [Event!]!
liveScores(leagueKey: ID!, daysFrom: Int): [LiveScore!]!
```

Upstream failures surface as typed errors via `extensions.code`:
`RATE_LIMITED`, `UPSTREAM_AUTH`, `UPSTREAM_UNAVAILABLE`, `UPSTREAM_ERROR`.

## Local development

```bash
cd api
npm install
cp .env.example .env        # optional — set ODDS_API_KEY for a private key
npm run dev                  # tsx watch, http://localhost:4000/
```

Then point the front-end at it (from `app/`):

```bash
cd app
echo "VITE_GRAPHQL_URL=http://localhost:4000/" >> .env
npm run dev                  # Vite on :4200, now sourcing leagues via GraphQL
```

When `VITE_GRAPHQL_URL` is **unset**, the front-end keeps calling the-odds-api
directly (the original client-only behavior), so nothing breaks if the backend
isn't running.

> Open the Apollo Sandbox at `http://localhost:4000/` to explore the schema and
> run queries interactively.

## Scripts

| Script            | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Watch-mode server via `tsx`                         |
| `npm run build`   | `tsc` to `dist/` + copy the SDL                     |
| `npm start`       | Run the compiled server (`node dist/index.js`)      |
| `npm run lint`    | Type-check only                                     |
| `npm run codegen` | Regenerate `src/generated/graphql.ts` from the SDL  |

## Configuration

All via environment (see `.env.example`):

| Var                  | Default                              | Purpose                       |
| -------------------- | ------------------------------------ | ----------------------------- |
| `ODDS_API_KEY`       | bundled public key                   | the-odds-api key (server-held)|
| `PORT`               | `4000`                               | listen port                   |
| `ODDS_API_BASE_URL`  | `https://api.the-odds-api.com/v4`    | upstream base URL             |
| `CACHE_TTL_LEAGUES`  | `3600000` (1h)                       | leagues cache TTL (ms)        |
| `CACHE_TTL_EVENTS`   | `60000` (1m)                         | odds cache TTL (ms)           |
| `CACHE_TTL_SCORES`   | `25000` (25s)                        | scores cache TTL (ms)         |

# AllOdds

Compare live sports betting odds across every major US sportsbook in one place.
Pick a sport, drill into a league, and view moneyline / spread / total lines side
by side — with the **best available price for each outcome highlighted**.

Odds data comes from [the-odds-api.com](https://the-odds-api.com/).

## Tech stack

- **React 18** + **TypeScript**
- **Vite** for dev/build
- **Tailwind CSS** for styling (custom dark "sportsbook" theme)
- **React Aria Components** for accessible, design-system primitives (selects, search, etc.)
- **React Router** for routing
- **Firebase** Hosting + Analytics

> This app was migrated from its original Angular 16 implementation to React.

## Routes

| Path                                      | View                                            |
| ----------------------------------------- | ----------------------------------------------- |
| `/`                                       | Sport groups (e.g. American Football, Soccer)   |
| `/sport/:group`                           | Leagues within a sport group                    |
| `/sport/:group/league/:leagueKey`         | Odds comparison table for a league's matchups   |

## Layout

This is an npm-workspaces monorepo:

- [`app/`](./app) — the front-end (React/Vite/TS).
- [`api/`](./api) — the optional GraphQL backend (see below).

## Development

```bash
npm install
npm run dev        # start the dev server at http://localhost:4200
```

The root scripts delegate to the `app` workspace, so they work the same as
before the restructure. Other scripts:

```bash
npm run build      # type-check + production build into app/dist/all-odds
npm run preview    # preview the production build
npm run lint       # type-check only (tsc --noEmit)
```

## Configuration

The odds-API key is read from the `VITE_ODDS_API_KEY` environment variable, with a
fallback to the project's existing key. To use your own key, create a `.env`:

```bash
VITE_ODDS_API_KEY=your_key_here
```

## GraphQL backend (optional)

A standalone **Node + TypeScript + Apollo Server** backend lives in
[`api/`](./api). It's the start of a single typed API surface that proxies
the third-party data sources server-side (keys off the client, plus caching and
rate-limit handling). It's **optional** — by default the app stays client-only
and calls the-odds-api directly.

To run the app against the backend (a vertical slice — the sports/leagues list
is served via GraphQL):

```bash
# terminal 1 — backend
cd api && npm install && npm run dev      # http://localhost:4000/

# terminal 2 — front-end
cd app
echo "VITE_GRAPHQL_URL=http://localhost:4000/" >> .env
npm run dev
```

When `VITE_GRAPHQL_URL` is unset (the default, including the deployed build), the
front-end calls the-odds-api directly as before. The GraphQL schema in
`api/src/schema.graphql` is the single source of truth: `npm run codegen`
(`app/` **and** `api/`) regenerates shared TypeScript types from it. See
[`api/README.md`](./api/README.md) for full details.

## Deployment

Firebase Hosting serves the `app/dist/all-odds` build output (see `firebase.json`).
The GitHub Actions workflows run `npm ci && npm run build` and deploy to Firebase
on PRs (preview channel) and merges to `main` (live).

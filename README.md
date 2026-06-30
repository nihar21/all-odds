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

## Development

```bash
npm install
npm run dev        # start the dev server at http://localhost:4200
```

Other scripts:

```bash
npm run build      # type-check + production build into dist/all-odds
npm run preview    # preview the production build
npm run lint       # type-check only (tsc --noEmit)
```

## Configuration

The odds-API key is read from the `VITE_ODDS_API_KEY` environment variable, with a
fallback to the project's existing key. To use your own key, create a `.env`:

```bash
VITE_ODDS_API_KEY=your_key_here
```

## Deployment

Firebase Hosting serves the `dist/all-odds` build output (see `firebase.json`).
The GitHub Actions workflows run `npm ci && npm run build` and deploy to Firebase
on PRs (preview channel) and merges to `main` (live).

<!-- CI trigger test 1 (with #30 in main): 2026-06-30T03:46:56Z -->

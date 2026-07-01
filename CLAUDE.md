# AllOdds — project guide for Claude

A client-only sportsbook odds comparison app. Compares moneyline / spread /
total lines across bookmakers, by sport → league → matchup, plus a cross-sport
live view.

## Tech stack
- React 18 + TypeScript, Vite, Tailwind CSS, React Aria Components, React Router.
- Data from the-odds-api.com v4 (client-only; API key is public by design,
  overridable via the `VITE_ODDS_API_KEY` env var).
- Hosted on Firebase Hosting; built into `app/dist/all-odds`.

## Repo layout
This is an npm-workspaces monorepo with the front-end and backend split into
top-level folders; `npm install`/`npm run <script>` at the repo root delegate
into the `app` workspace (see root `package.json`), so day-to-day commands are
unchanged from a single-package repo.
- **`app/`** — the front-end (React/Vite/TS), own `package.json`.
- **`api/`** — the backend (Node + GraphQL), own `package.json`. See below.

## Project layout (inside `app/`)
- `src/pages/` — route components: `SportsSelection` (home), `SportDetail`
  (leagues in a sport), `LeagueDetails` (odds for a league), `LiveSports`
  (`/live`). Routes are wired in `src/main.tsx`.
- `src/components/` — shared UI: `EventCard`, `OddsTable`, `MarketSelect`,
  `Layout`, `Breadcrumbs`, `ErrorView`, `Skeleton`, `LiveSportsButton`.
- `src/lib/api.ts` — the-odds-api client (`getSportsList`, `getAllOdds`,
  `getUpcomingOdds`) + the in-memory request cache.
- `src/lib/odds.ts` — odds formatting / table-row helpers (`isLive`,
  `formatPrice`, `bookColumns`, `rowsForMarket`, `bestBooksForRow`, …).
- `src/constants.ts` — bookmaker order & titles, sport icons, market labels.
- `src/types/index.ts` — the-odds-api response shapes.
- `src/lib/graphql/` — optional GraphQL backend integration: `client.ts`
  (Apollo Client + `BACKEND_ENABLED` flag), `*.graphql` operations, and the
  committed codegen output `generated.ts`.

## Backend (optional GraphQL layer, `api/`)
- `api/` is a **separate** Node + TypeScript + Apollo Server backend (own
  `package.json`, not part of the Firebase build). Proxies the-odds-api behind a
  typed GraphQL schema with server-side caching + rate-limit handling. See
  `api/README.md`.
- The app is **client-only by default**. When `VITE_GRAPHQL_URL` is set, feature
  loaders that have been migrated (currently only `getSportsList`) source data
  from the `api/` GraphQL backend instead of calling the-odds-api directly;
  unset, behavior is unchanged (so the deployed build is unaffected).
- `api/src/schema.graphql` is the single source of truth. Both `app/` and
  `api/` run `npm run codegen` against it to regenerate shared TS types
  (`app/src/lib/graphql/generated.ts` and `api/src/generated/graphql.ts`). The
  generated files are committed so builds never depend on codegen running.
- To migrate another feature: add a `.graphql` operation under
  `app/src/lib/graphql/`, run codegen, and branch on `BACKEND_ENABLED` in its
  loader (mirror `getSportsList`). Add the matching resolver in
  `api/src/resolvers/`.

## Conventions & gotchas
- Fetch data with the `useAsync(loader, deps)` hook and render explicit
  loading / error / empty states (mirror an existing page rather than rolling
  a new pattern).
- `cachedGet` in `lib/api.ts` caches every response by URL for the whole
  session with **no TTL** — data does not refresh until a full page reload.
  Account for this in any freshness-sensitive ("live") feature.
- Markets are `'h2h' | 'spreads' | 'totals'`. Odds pages reuse `EventCard`
  with a master + per-event `MarketSelect`.
- Use the special `upcoming` sport key (`getUpcomingOdds`) for cross-sport
  queries; it returns a bounded set (live + next games), not an exhaustive list.
- Reuse `BOOKMAKERS` ordering and `sportIcon()` from `constants.ts` rather than
  hardcoding book/sport display details.
- Team logos are build-time: `app/scripts/fetch-logos.mjs` fetches from ESPN and
  writes `src/data/teamLogos.json` + `public/logos/` (both under `app/`);
  `src/lib/logos.ts` / `TeamLogo.tsx` render them with a placeholder fallback.
  ESPN is unreachable from the web/CI sandbox, so the manifest must be
  generated where egress is allowed (see the logos bug in the backlog).

## Build / tests
- `npm run lint` → `tsc --noEmit` (in `app/`)
- `npm run test` → Vitest unit tests (`app/src/lib/__tests__/`, jsdom env via
  `app/vitest.config.ts` / `app/src/test/setup.ts`). Currently covers the pure
  logic in `lib/odds.ts`, `lib/logos.ts`, and `lib/api.ts` (fetch mocked).
- `npm run build` → `tsc && vite build` (outputs to `app/dist/all-odds`)
- `npm run verify` runs all three (lint → test → build) — the single
  command an agent or CI should run to validate a change. All of these are
  root-level scripts that delegate to the `app` workspace (`npm run <script>
  -w app`); running them from the repo root or from `app/` behaves the same.
- CI (`.github/workflows/firebase-hosting-pull-request.yml`) runs
  `npm ci && npm run verify` on every PR and deploys a preview. "Tests pass" /
  "green" means this check succeeds.
- Pinned `typescript@5.5.4`. If the environment's global TypeScript is newer it
  surfaces an unrelated `tsconfig` `baseUrl` deprecation error — run
  `npm install --no-save typescript@5.5.4 -w app` first to typecheck against
  the pin.

## Local dev / verifying the UI
- `npm run dev` (Vite, port 4200) or `npm run preview` after a build. Built
  output uses base path `/all-odds`; `vite preview` serves it at the root.
- In the web sandbox, outbound calls to the-odds-api are blocked, so pages
  render their **error / empty states** during local verification — expected,
  not a regression. Build success + a screenshot of routing/layout is the
  realistic local check; live data only appears in deployed previews.

## Feature / issue workflow (standing rule)

When asked to implement a feature or a GitHub issue, run this end-to-end
without waiting for further prompting, except at the explicit checkpoint noted:

1. **Implement** the change on the designated feature branch. Before starting,
   **branch from the latest `origin/main`** (or rebase) so you're not working
   against stale code — investigating/building on an out-of-date branch produces
   wrong conclusions and duplicate tickets.
2. **Verify locally**: `npm run build` must pass (clean `tsc` + Vite build).
3. **Open a PR** against `main` (unless a PR for the branch already exists, in
   which case push to update it).
4. **Run `/code-review --comment`** to post findings as inline PR comments.
5. **Address every finding**: push fixes, and reply on threads where a finding
   is intentionally not actioned (with the reason), then resolve those threads.
6. **Confirm green**: CI build check passes and all review findings are resolved.
7. **Get sign-off, then squash-merge.** Once steps 5–6 are satisfied, ask the
   user and **wait for explicit approval before merging any PR that changes
   application code** (anything under `src/`, build config, deps, CI, etc.). Do
   not auto-merge feature/code PRs. Use the **squash** merge method.
   - **Exception — trivial PRs that don't affect the actual code/app** (e.g.
     docs-only, `CLAUDE.md`, comments, README) may be squash-merged
     automatically once CI is green, no sign-off needed.

If a review finding is ambiguous or implies a large refactor, ask before acting
rather than guessing. Never merge while CI is failing or findings are
unresolved. This workflow is for code features/issues; skip the code-review step
for docs-only or config-only changes (there is nothing executable to review).

## Tracking issue state (standing rule)

Keep GitHub issue state in sync with reality so the backlog is trustworthy and
we never duplicate shipped work:

1. **Before filing or starting**, search the backlog (open **and** closed) for
   an existing issue. Work against it instead of opening a duplicate.
2. **When work begins**, mark the issue **In Progress**.
3. **When merged/shipped**, **close** the issue and reference the PR. Don't
   leave shipped work open.
4. A follow-up to an already-shipped issue is a **new** enhancement that
   cross-references the original — don't reopen merged work.

> Motivation: we previously nearly re-specced a shipped feature, and a bug was
> misdiagnosed off a stale branch, because state wasn't tracked. Keeping states
> current prevents both.

**State mechanism:** GitHub issues are natively only open/closed. For richer
states (Backlog → In Progress → In Review → Done) use either `status:` labels
(e.g. `status: in-progress`, `status: in-review` — an agent can apply/swap these
via the API) or a GitHub Projects (v2) board with a Status field. As of this
writing only `bug` and `enhancement` labels exist — set up one of the above
before relying on automated state tracking.

# AllOdds — project guide for Claude

## Tech stack
- React 18 + TypeScript, Vite, Tailwind CSS, React Aria Components, React Router.
- Data from the-odds-api.com v4 (client-only; API key is public by design).
- Hosted on Firebase Hosting; built into `dist/all-odds`.

## Build / "tests"
- There is no separate unit-test suite. The quality gate is the build:
  - `npm run lint` → `tsc --noEmit`
  - `npm run build` → `tsc && vite build`
- CI (`.github/workflows/firebase-hosting-pull-request.yml`) runs
  `npm ci && npm run build` on every PR and deploys a preview. "Tests pass" /
  "green" means this build check succeeds.
- Note: this environment may have a newer global TypeScript than the pinned
  `typescript@5.5.4`, which surfaces an unrelated `tsconfig` `baseUrl`
  deprecation error. To typecheck against the pinned version, run
  `npm install --no-save typescript@5.5.4` first.

## Feature / issue workflow (standing rule)

When asked to implement a feature or a GitHub issue, run this end-to-end
without waiting for further prompting, except at the explicit checkpoint noted:

1. **Implement** the change on the designated feature branch.
2. **Verify locally**: `npm run build` must pass (clean `tsc` + Vite build).
3. **Open a PR** against `main` (unless a PR for the branch already exists, in
   which case push to update it).
4. **Run `/code-review --comment`** to post findings as inline PR comments.
5. **Address every finding**: push fixes, and reply on threads where a finding
   is intentionally not actioned (with the reason).
6. **Confirm green**: CI build check passes and all review findings are resolved.
7. **Squash-merge automatically** once steps 5–6 are satisfied. No confirmation
   needed — the user has authorized auto-merge when green. Use the **squash**
   merge method.

If a review finding is ambiguous or implies a large refactor, ask before acting
rather than guessing. Do not auto-merge if CI is failing or findings are unresolved.

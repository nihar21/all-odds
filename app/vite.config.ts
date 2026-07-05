import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

function commitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    // No .git available (e.g. an archive build) — fall back to a CI-provided SHA if present.
    return process.env.GITHUB_SHA?.slice(0, 7) ?? 'unknown';
  }
}

// Build into dist/all-odds (i.e. app/dist/all-odds from the repo root) to stay
// compatible with the existing Firebase Hosting config.
export default defineConfig({
  plugins: [react()],
  // Pre-restructure, .env lived at the repo root (Vite's default envDir).
  // Keep reading it from there so root-level VITE_ODDS_API_KEY / VITE_GRAPHQL_URL
  // overrides still work without users/CI having to relocate their .env.
  envDir: '..',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __COMMIT_HASH__: JSON.stringify(commitHash()),
  },
  build: {
    outDir: 'dist/all-odds',
    emptyOutDir: true,
  },
  server: {
    port: 4200,
    host: true,
  },
});

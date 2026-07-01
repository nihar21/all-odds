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

// Build into dist/all-odds to stay compatible with the existing Firebase Hosting config.
export default defineConfig({
  plugins: [react()],
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

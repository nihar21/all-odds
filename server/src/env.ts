// Load `server/.env` into process.env before any module reads config. Uses
// Node's built-in env-file loader (Node >= 20.12); a missing file is fine —
// the server falls back to bundled defaults. Import this FIRST in the entry
// point so config sees the values.
try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch {
  // No .env present (or unsupported Node) — rely on real env vars / defaults.
}

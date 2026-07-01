/**
 * Server configuration, sourced entirely from the environment so secrets stay
 * off the client. Copy `.env.example` to `.env` (loaded by `node --env-file`,
 * see the dev/start scripts) and set `ODDS_API_KEY`.
 */
export const config = {
  port: Number(process.env.PORT ?? 4000),

  oddsApi: {
    baseUrl: process.env.ODDS_API_BASE_URL ?? 'https://api.the-odds-api.com/v4',
    // Falls back to the project's existing public key so the server boots out of
    // the box; production deployments should set a private key via the env.
    apiKey: process.env.ODDS_API_KEY ?? 'b4bfd1cbef0039a797cf01b3b62bc2bc',
  },

  /**
   * Per-endpoint cache TTLs (ms). The upstream provider updates odds every few
   * minutes and live scores roughly every 30s, so unlike the client's
   * no-TTL session cache these expire and let data refresh.
   */
  cacheTtl: {
    leagues: Number(process.env.CACHE_TTL_LEAGUES ?? 60 * 60 * 1000), // 1h
    events: Number(process.env.CACHE_TTL_EVENTS ?? 60 * 1000), // 1m
    scores: Number(process.env.CACHE_TTL_SCORES ?? 25 * 1000), // 25s
  },
} as const;

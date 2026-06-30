import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorView } from '../components/ErrorView';
import { CardGridSkeleton } from '../components/Skeleton';
import {
  centsToAmericanOdds,
  centsToDecimalOdds,
  centsToProbability,
  getKalshiMarkets,
} from '../lib/kalshi';
import { formatPrice } from '../lib/odds';

/**
 * Throwaway read-only PoC for the #31 Kalshi spike: pulls open markets from
 * Kalshi's public API and converts cent prices to American/decimal odds so
 * they can be eyeballed next to sportsbook lines. Not linked from primary
 * navigation — reachable directly at /kalshi-preview.
 */
export function KalshiPreview() {
  const [seriesTicker, setSeriesTicker] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error } = useAsync(
    () => getKalshiMarkets({ seriesTicker: query || undefined }),
    [query],
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sports', to: '/' }, { label: 'Kalshi (spike)' }]} />

      <div className="mb-6 animate-fade-up">
        <span className="pill border-accent/30 bg-accent/15 text-accent-soft">Spike — #31</span>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Kalshi Markets Preview
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Read-only proof-of-concept: fetches open markets from Kalshi&apos;s public, unauthenticated
          API and converts each &quot;Yes&quot; cent price (an implied probability) to American and
          decimal odds.
        </p>
        <form
          className="mt-4 flex max-w-sm gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(seriesTicker.trim());
          }}
        >
          <input
            value={seriesTicker}
            onChange={(e) => setSeriesTicker(e.target.value)}
            placeholder="Series ticker (optional)"
            className="flex-1 rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-accent/70"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-ink-700/80"
          >
            Load
          </button>
        </form>
      </div>

      {loading && <CardGridSkeleton count={6} />}

      {error && (
        <ErrorView
          title="Couldn't load Kalshi markets"
          message={`${error} Kalshi's API may be unreachable from this environment.`}
        />
      )}

      {!loading && !error && (!data || data.length === 0) && (
        <ErrorView
          title="No open markets"
          message="Try a different series ticker, or leave it blank for the default page of open markets."
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="px-4 py-3 font-medium">Market</th>
                <th className="px-4 py-3 font-medium">Yes ¢</th>
                <th className="px-4 py-3 font-medium">Probability</th>
                <th className="px-4 py-3 font-medium">American</th>
                <th className="px-4 py-3 font-medium">Decimal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.ticker} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{m.title}</td>
                  <td className="px-4 py-3 text-slate-300">{m.last_price}¢</td>
                  <td className="px-4 py-3 text-slate-300">
                    {Math.round(centsToProbability(m.last_price) * 100)}%
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatPrice(centsToAmericanOdds(m.last_price))}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {centsToDecimalOdds(m.last_price) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

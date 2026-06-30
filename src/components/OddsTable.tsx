import { useMemo } from 'react';
import type { MarketKey, OddsEvent } from '../types';
import {
  bestBooksForRow,
  bookColumns,
  formatPoint,
  formatPrice,
  formatRelativeTime,
  getOutcome,
  isLive,
  latestMarketUpdate,
  rowsForMarket,
} from '../lib/odds';
import { useFavoriteBooks } from '../hooks/useFavoriteBooks';

interface OddsTableProps {
  event: OddsEvent;
  market: MarketKey;
}

export function OddsTable({ event, market }: OddsTableProps) {
  const { favorites } = useFavoriteBooks();
  const columns = useMemo(
    () => bookColumns(event, favorites),
    [event, favorites],
  );
  const rows = useMemo(() => rowsForMarket(event, market), [event, market]);
  const best = useMemo(
    () =>
      rows.map((row) =>
        bestBooksForRow(event, market, row.outcomeName, columns),
      ),
    [event, market, rows, columns],
  );
  const live = isLive(event.commence_time);
  const updated = useMemo(
    () =>
      live
        ? latestMarketUpdate(
            event,
            market,
            new Set(columns.map((col) => col.key)),
          )
        : null,
    [live, event, market, columns],
  );

  if (columns.length === 0) {
    // Distinguish "this matchup has no odds at all" from "your favorites have no
    // odds for it" so the empty filter result is actionable.
    const hasAnyBooks = event.bookmakers.length > 0;
    return (
      <p className="px-1 py-6 text-center text-sm text-slate-400">
        {hasAnyBooks && favorites.size > 0
          ? 'None of your favorite sportsbooks have odds for this matchup. Adjust your favorites to see more.'
          : 'No sportsbook odds available for this matchup yet.'}
      </p>
    );
  }

  return (
    <div>
      {live && updated && (
        <div className="flex items-center gap-1.5 px-4 pb-2 pt-3 text-xs text-rose-300 sm:px-5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          Live odds · updated {formatRelativeTime(updated)}
        </div>
      )}
      <div className="scroll-slim overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[9rem] rounded-tl-xl bg-ink-800/95 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 backdrop-blur"
              >
                Outcome
              </th>
              {columns.map((col) => (
                <th
                  scope="col"
                  key={col.key}
                  className="min-w-[5.5rem] border-b border-white/10 bg-ink-800/60 px-3 py-2.5 text-center text-xs font-semibold text-slate-300"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.outcomeName} className="group">
                <th
                  scope="row"
                  className="sticky left-0 z-10 min-w-[9rem] border-b border-white/5 bg-ink-900/95 px-4 py-3 text-left backdrop-blur"
                >
                  <div className="font-semibold text-white">{row.label}</div>
                  {row.sublabel && (
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      {row.sublabel}
                    </div>
                  )}
                </th>
                {columns.map((col) => {
                  const outcome = getOutcome(
                    event,
                    col.key,
                    market,
                    row.outcomeName,
                  );
                  const isBest = best[ri].has(col.key) && !!outcome;
                  const price = outcome?.price ?? null;
                  const showPoint = market !== 'h2h' && outcome?.point !== undefined;

                  return (
                    <td
                      key={col.key}
                      className="border-b border-white/5 px-2 py-2 text-center align-middle"
                    >
                      {outcome ? (
                        <div
                          className={`mx-auto flex min-w-[3.75rem] flex-col items-center rounded-lg px-2 py-1.5 leading-tight transition ${
                            isBest
                              ? 'bg-accent/15 ring-1 ring-accent/60'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          {showPoint && (
                            <span className="font-mono text-[11px] text-slate-400">
                              {formatPoint(outcome.point)}
                            </span>
                          )}
                          <span
                            className={`font-mono font-semibold ${
                              isBest ? 'text-accent-soft' : 'text-slate-100'
                            }`}
                          >
                            {formatPrice(price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

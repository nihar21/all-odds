import { useMemo, useState } from 'react';
import type { MarketKey, OddsEvent } from '../types';
import {
  bestBooksForRow,
  bookColumns,
  formatOdds,
  formatPoint,
  formatRelativeTime,
  getOutcome,
  isLive,
  latestMarketUpdate,
  rowsForMarket,
  sortRows,
  type OddsSort,
} from '../lib/odds';
import { useFavoriteBooks } from '../hooks/useFavoriteBooks';
import { useOddsFormat } from '../hooks/useOddsFormat';

interface OddsTableProps {
  event: OddsEvent;
  market: MarketKey;
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onToggle,
  thClassName,
  buttonClassName,
}: {
  label: string;
  sortKey: OddsSort['key'];
  sort: OddsSort | null;
  onToggle: (key: OddsSort['key']) => void;
  thClassName: string;
  buttonClassName: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={thClassName}
    >
      <button type="button" onClick={() => onToggle(sortKey)} className={buttonClassName}>
        {label}
        {active && <SortArrow dir={sort!.dir} />}
      </button>
    </th>
  );
}

function SortArrow({ dir }: { dir: 'asc' | 'desc' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === 'asc' ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
}

export function OddsTable({ event, market }: OddsTableProps) {
  const { favorites } = useFavoriteBooks();
  const { format } = useOddsFormat();
  const columns = useMemo(
    () => bookColumns(event, favorites),
    [event, favorites],
  );
  const rows = useMemo(() => rowsForMarket(event, market), [event, market]);
  const [sort, setSort] = useState<OddsSort | null>(null);

  // Reset the sort synchronously during render — rather than in an Effect —
  // so a market change never paints a frame with the old market's sort still
  // applied. Tracked with state (not a ref): mutating a ref during render is
  // not idempotent under StrictMode's double-invoke, which caused the reset
  // to silently lose to a stale second render pass.
  const [prevMarket, setPrevMarket] = useState(market);
  if (market !== prevMarket) {
    setPrevMarket(market);
    if (sort !== null) setSort(null);
  } else if (
    sort &&
    sort.key !== 'outcome' &&
    !columns.some((col) => col.key === sort.key)
  ) {
    setSort(null);
  }

  function toggleSort(key: OddsSort['key']) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  }

  const sortedRows = useMemo(
    () => sortRows(rows, event, market, sort),
    [rows, sort, event, market],
  );

  const best = useMemo(
    () =>
      sortedRows.map((row) =>
        bestBooksForRow(event, market, row.outcomeName, columns),
      ),
    [event, market, sortedRows, columns],
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
              <SortableHeader
                label="Outcome"
                sortKey="outcome"
                sort={sort}
                onToggle={toggleSort}
                thClassName="sticky left-0 z-10 min-w-[9rem] rounded-tl-xl bg-ink-800/95 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 backdrop-blur"
                buttonClassName="flex items-center gap-1 uppercase tracking-wide hover:text-slate-200"
              />
              {columns.map((col) => (
                <SortableHeader
                  key={col.key}
                  label={col.title}
                  sortKey={col.key}
                  sort={sort}
                  onToggle={toggleSort}
                  thClassName="min-w-[5.5rem] border-b border-white/10 bg-ink-800/60 px-3 py-2.5 text-center text-xs font-semibold text-slate-300"
                  buttonClassName="flex w-full items-center justify-center gap-1 hover:text-slate-100"
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, ri) => (
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
                  const url = outcome ? col.url ?? null : null;
                  const cellClassName = `mx-auto flex min-w-[3.75rem] flex-col items-center rounded-lg px-2 py-1.5 leading-tight transition ${
                    isBest
                      ? 'bg-accent/15 ring-1 ring-accent/60'
                      : 'hover:bg-white/5'
                  }`;
                  const cellContent = (
                    <>
                      {showPoint && (
                        <span className="font-mono text-[11px] text-slate-400">
                          {formatPoint(outcome!.point)}
                        </span>
                      )}
                      <span
                        className={`font-mono font-semibold ${
                          isBest ? 'text-accent-soft' : 'text-slate-100'
                        }`}
                      >
                        {formatOdds(price, format)}
                      </span>
                    </>
                  );

                  return (
                    <td
                      key={col.key}
                      className="border-b border-white/5 px-2 py-2 text-center align-middle"
                    >
                      {outcome ? (
                        url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Bet ${row.label} at ${col.title}`}
                            className={`${cellClassName} cursor-pointer`}
                          >
                            {cellContent}
                          </a>
                        ) : (
                          <div className={cellClassName}>{cellContent}</div>
                        )
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

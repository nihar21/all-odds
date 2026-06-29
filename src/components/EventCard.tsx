import type { MarketKey, OddsEvent } from '../types';
import { formatGameTime, isLive, marketSummary } from '../lib/odds';
import { MARKET_LABELS } from '../constants';
import { MarketSelect } from './MarketSelect';
import { OddsTable } from './OddsTable';

interface EventCardProps {
  event: OddsEvent;
  market: MarketKey;
  onMarketChange: (market: MarketKey) => void;
}

export function EventCard({ event, market, onMarketChange }: EventCardProps) {
  const { day, time } = formatGameTime(event.commence_time);
  const live = isLive(event.commence_time);
  const summary = marketSummary(event, market);
  const bookCount = event.bookmakers.length;

  return (
    <article className="card-surface animate-fade-up overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            {live ? (
              <span className="pill border-rose-400/30 bg-rose-500/15 text-rose-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                Live
              </span>
            ) : (
              <span className="pill">
                {day} · {time}
              </span>
            )}
            {summary && (
              <span className="pill border-accent/30 bg-accent/10 text-accent-soft">
                {MARKET_LABELS[market]}: {summary}
              </span>
            )}
          </div>
          <h3 className="truncate font-display text-lg font-600 text-white">
            {event.away_team ?? 'Away'}{' '}
            <span className="text-slate-500">@</span>{' '}
            {event.home_team ?? 'Home'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {bookCount} sportsbook{bookCount === 1 ? '' : 's'} · best price
            highlighted
          </p>
        </div>
        <div className="shrink-0">
          <MarketSelect value={market} onChange={onMarketChange} size="sm" />
        </div>
      </div>

      <OddsTable event={event} market={market} />
    </article>
  );
}

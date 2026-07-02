import type { OddsEvent } from '../types';
import { formatGameTime, isLive } from '../lib/odds';
import { OddsTable } from './OddsTable';

interface OutrightCardProps {
  event: OddsEvent;
}

/**
 * Card for an outright/futures market (e.g. a tournament or election winner).
 * Unlike EventCard there's no home/away matchup — the event title names the
 * market and the table lists every competitor with the best price highlighted.
 */
export function OutrightCard({ event }: OutrightCardProps) {
  const { day, time } = formatGameTime(event.commence_time);
  const live = isLive(event.commence_time);
  const bookCount = event.bookmakers.length;

  return (
    <article className="card-surface animate-fade-up overflow-hidden">
      <div className="border-b border-white/10 p-4 sm:p-5">
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
          <span className="pill border-accent/30 bg-accent/10 text-accent-soft">
            Winner
          </span>
        </div>
        <h3 className="truncate font-display text-lg font-semibold text-white">
          {event.sport_title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {bookCount} sportsbook{bookCount === 1 ? '' : 's'} · best price
          highlighted
        </p>
      </div>

      <OddsTable event={event} market="outrights" />
    </article>
  );
}

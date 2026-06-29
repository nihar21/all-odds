import type { MarketKey, OddsEvent, ScoreEvent } from '../types';
import { formatGameTime, isLive, marketSummary, teamScore } from '../lib/odds';
import { MARKET_LABELS } from '../constants';
import { MarketSelect } from './MarketSelect';
import { OddsTable } from './OddsTable';
import { TeamLogo } from './TeamLogo';

interface EventCardProps {
  event: OddsEvent;
  market: MarketKey;
  onMarketChange: (market: MarketKey) => void;
  /** Live/final scores for this event, joined by id (see `useLiveScores`). */
  score?: ScoreEvent;
}

export function EventCard({ event, market, onMarketChange, score }: EventCardProps) {
  const { day, time } = formatGameTime(event.commence_time);
  const live = isLive(event.commence_time);
  const completed = score?.completed ?? false;
  const summary = marketSummary(event, market);
  const bookCount = event.bookmakers.length;

  const awayScore = teamScore(score, event.away_team);
  const homeScore = teamScore(score, event.home_team);

  return (
    <article className="card-surface animate-fade-up overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            {completed ? (
              <span className="pill border-slate-400/30 bg-slate-500/15 text-slate-300">
                Final
              </span>
            ) : live ? (
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
          <h3 className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold text-white">
            <TeamLogo team={event.away_team} size={24} />
            <span className="truncate">{event.away_team ?? 'Away'}</span>
            {awayScore !== null && (
              <span className="shrink-0 font-mono font-bold text-slate-300">
                {awayScore}
              </span>
            )}
            <span className="shrink-0 text-slate-500">@</span>
            <TeamLogo team={event.home_team} size={24} />
            <span className="truncate">{event.home_team ?? 'Home'}</span>
            {homeScore !== null && (
              <span className="shrink-0 font-mono font-bold text-slate-300">
                {homeScore}
              </span>
            )}
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

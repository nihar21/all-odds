import { Radio, RadioGroup } from 'react-aria-components';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BookFilter } from '../components/BookFilter';
import { ODDS_FORMATS, ODDS_FORMAT_DESCRIPTIONS, ODDS_FORMAT_LABELS } from '../constants';
import { formatOdds } from '../lib/odds';
import { useOddsFormat } from '../hooks/useOddsFormat';

// Sample price used for the live format preview below the selector.
const PREVIEW_PRICE = -150;

export function Settings() {
  const { format, setFormat } = useOddsFormat();

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sports', to: '/' }, { label: 'Settings' }]} />

      <div className="mb-8 animate-fade-up">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-slate-400">
          Preferences are saved to this browser and apply across the app.
        </p>
      </div>

      <section className="card-surface mb-6 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-white">Odds format</h2>
        <p className="mt-1 text-sm text-slate-400">
          Choose how prices are displayed everywhere odds show up.
        </p>

        <RadioGroup
          value={format}
          onChange={(value) => setFormat(value as typeof format)}
          aria-label="Odds format"
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {ODDS_FORMATS.map((option) => (
            <Radio
              key={option}
              value={option}
              className="group flex cursor-pointer flex-col gap-1 rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 outline-none transition hover:border-white/20 selected:border-accent/60 selected:bg-accent/10 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70"
            >
              {({ isSelected }) => (
                <>
                  <span
                    className={`font-medium ${isSelected ? 'text-accent-soft' : 'text-white'}`}
                  >
                    {ODDS_FORMAT_LABELS[option]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {ODDS_FORMAT_DESCRIPTIONS[option]}
                  </span>
                  <span className="mt-1 font-mono text-sm font-semibold text-slate-200">
                    {formatOdds(PREVIEW_PRICE, option)}
                  </span>
                </>
              )}
            </Radio>
          ))}
        </RadioGroup>
      </section>

      <section className="card-surface p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          Favorite sportsbooks
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Odds tables narrow to just these books. Stays in sync with the filter on
          league and live pages.
        </p>
        <div className="mt-4">
          <BookFilter label="Favorite books" />
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
} from 'react-aria-components';
import {
  getLocalTimeZone,
  parseDate,
  today,
  type CalendarDate,
} from '@internationalized/date';
import { formatDateLabel, todayKey as getTodayKey } from '../lib/odds';

/** Sentinel key for the "All days" option (no date filter). */
export const ALL_DAYS = '__all__';

interface DatePickerProps {
  /** Sorted list of local-day keys (`YYYY-MM-DD`) that have events. */
  dates: string[];
  /** Currently selected key, or `ALL_DAYS`. */
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}

const arrowClass =
  'grid w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-ink-800/80 text-slate-300 outline-none transition hover:border-white/20 hover:bg-ink-700/80 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-ink-800/80';

/** Shared style for the "Today" / "All days" quick-action buttons in the calendar popover. */
const popoverActionClass =
  'flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 outline-none transition hover:border-white/20 hover:bg-white/5 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70 aria-pressed:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-transparent';

/**
 * Traditional month-calendar date picker with prev/next day arrows. Days that
 * have events are selectable; days without are dimmed and disabled. The center
 * button opens a month grid; the flanking arrows step to the previous/next day
 * that has events. An "All days" action clears the filter.
 */
export function DatePicker({ dates, value, onChange, label }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // -1 represents the "All days" state; otherwise the index within `dates`.
  const index = value === ALL_DAYS ? -1 : dates.indexOf(value);
  const canPrev = index > 0;
  const canNext = index < dates.length - 1; // from All days (-1), steps into dates[0]

  const goPrev = () => {
    if (canPrev) onChange(dates[index - 1]);
  };
  const goNext = () => {
    if (canNext) onChange(dates[index + 1]);
  };

  const selected: CalendarDate | null =
    value === ALL_DAYS ? null : parseDate(value);
  const focused = selected ?? (dates[0] ? parseDate(dates[0]) : today(getLocalTimeZone()));
  const displayLabel = value === ALL_DAYS ? 'All days' : formatDateLabel(value);

  const availableSet = new Set(dates);

  const todayKey = getTodayKey();
  const hasToday = availableSet.has(todayKey);
  const isToday = value === todayKey;

  const goToday = () => {
    onChange(todayKey);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {hasToday && !isToday && (
        <button
          type="button"
          onClick={goToday}
          className="pill self-start text-accent outline-none transition hover:border-white/20 hover:bg-white/10 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70"
        >
          Today
        </button>
      )}
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
      )}
      <div className="flex items-stretch gap-1.5">
        <button
          type="button"
          aria-label="Previous day"
          onClick={goPrev}
          disabled={!canPrev}
          className={arrowClass}
        >
          <Chevron dir="left" />
        </button>

        <DialogTrigger isOpen={open} onOpenChange={setOpen}>
          <Button
            aria-label="Choose date"
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-800/80 px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:border-white/20 hover:bg-ink-700/80 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70 sm:min-w-[10rem]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>{displayLabel}</span>
          </Button>

          <Popover className="origin-top rounded-xl border border-white/10 bg-ink-800 p-3 shadow-card entering:animate-fade-up">
            <Dialog className="outline-none" aria-label="Pick a date">
              <Calendar
                aria-label="Event date"
                value={selected}
                defaultFocusedValue={focused}
                isDateUnavailable={(date) => !availableSet.has(date.toString())}
                onChange={(date) => {
                  onChange(date.toString());
                  setOpen(false);
                }}
              >
                <header className="mb-2 flex items-center justify-between gap-2">
                  <Button slot="previous" aria-label="Previous month" className={arrowClass}>
                    <Chevron dir="left" />
                  </Button>
                  <Heading className="font-display text-sm font-semibold text-white" />
                  <Button slot="next" aria-label="Next month" className={arrowClass}>
                    <Chevron dir="right" />
                  </Button>
                </header>
                <CalendarGrid className="w-full border-separate border-spacing-1">
                  <CalendarGridHeader>
                    {(day) => (
                      <CalendarHeaderCell className="pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-sm text-slate-200 outline-none transition data-[hovered]:bg-white/10 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70 data-[selected]:bg-accent data-[selected]:font-semibold data-[selected]:text-ink-950 data-[unavailable]:cursor-default data-[unavailable]:text-slate-600 data-[disabled]:text-slate-700 data-[outside-month]:invisible"
                      >
                        {({ formattedDate, isUnavailable, isSelected }) => (
                          <>
                            <span>{formattedDate}</span>
                            {!isUnavailable && !isSelected && (
                              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
                            )}
                          </>
                        )}
                      </CalendarCell>
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  disabled={!hasToday}
                  title={!hasToday ? 'No events today' : undefined}
                  className={popoverActionClass}
                  aria-pressed={isToday}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(ALL_DAYS);
                    setOpen(false);
                  }}
                  className={popoverActionClass}
                  aria-pressed={value === ALL_DAYS}
                >
                  All days
                </button>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>

        <button
          type="button"
          aria-label="Next day"
          onClick={goNext}
          disabled={!canNext}
          className={arrowClass}
        >
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  );
}

import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components';
import { formatDateLabel } from '../lib/odds';

/** Sentinel key for the "All days" option (no date filter). */
export const ALL_DAYS = '__all__';

interface DateSelectProps {
  /** Sorted list of local-day keys (`YYYY-MM-DD`) that have events. */
  dates: string[];
  /** Currently selected key, or `ALL_DAYS`. */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: 'sm' | 'md';
}

function optionLabel(key: string): string {
  return key === ALL_DAYS ? 'All days' : formatDateLabel(key);
}

export function DateSelect({
  dates,
  value,
  onChange,
  label,
  size = 'md',
}: DateSelectProps) {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm';
  const keys = [ALL_DAYS, ...dates];

  return (
    <Select
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as string)}
      className="flex flex-col gap-1.5"
      aria-label={label ? undefined : 'Select date'}
    >
      {label && (
        <Label className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </Label>
      )}
      <Button
        className={`group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-800/80 ${pad} font-medium text-white outline-none transition hover:border-white/20 hover:bg-ink-700/80 pressed:bg-ink-700 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70`}
      >
        <SelectValue className="data-[placeholder]:text-slate-400" />
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-slate-400 transition group-data-[open]:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>
      <Popover className="w-[--trigger-width] origin-top overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card entering:animate-fade-up">
        <ListBox className="max-h-72 overflow-auto p-1 outline-none">
          {keys.map((key) => (
            <ListBoxItem
              key={key}
              id={key}
              textValue={optionLabel(key)}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition hovered:bg-white/10 focused:bg-white/10 selected:text-accent"
            >
              {({ isSelected }) => (
                <>
                  <span>{optionLabel(key)}</span>
                  {isSelected && (
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
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  )}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

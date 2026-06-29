import {
  Button,
  Dialog,
  DialogTrigger,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  type Selection,
} from 'react-aria-components';
import { BOOKMAKERS } from '../constants';
import { useFavoriteBooks } from '../hooks/useFavoriteBooks';

interface BookFilterProps {
  label?: string;
  size?: 'sm' | 'md';
}

/**
 * Control for choosing favorite sportsbooks. When any are selected, odds tables
 * across the app show only those books; with none selected every book shows
 * (the default). Styled to match `MarketSelect` so it reads as a native control.
 */
export function BookFilter({ label, size = 'md' }: BookFilterProps) {
  const { favorites, favoriteList, setFavorites, clear } = useFavoriteBooks();
  const pad = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm';

  const count = favoriteList.length;
  const triggerLabel =
    count === 0 ? 'All books' : `${count} favorite${count === 1 ? '' : 's'}`;

  function handleSelectionChange(keys: Selection) {
    if (keys === 'all') {
      setFavorites(BOOKMAKERS.map((b) => b.key));
      return;
    }
    setFavorites(Array.from(keys, (k) => String(k)));
  }

  return (
    <DialogTrigger>
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </Label>
        )}
        <Button
          aria-label={label ? undefined : 'Filter sportsbooks'}
          className={`group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-800/80 ${pad} font-medium text-white outline-none transition hover:border-white/20 hover:bg-ink-700/80 pressed:bg-ink-700 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70`}
        >
          <span className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 ${count > 0 ? 'text-accent-soft' : 'text-slate-400'}`}
              fill={count > 0 ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
            </svg>
            {triggerLabel}
          </span>
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
      </div>
      <Popover className="w-64 origin-top overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-card entering:animate-fade-up">
        <Dialog className="outline-none" aria-label="Favorite sportsbooks">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Favorite books
            </span>
            <Button
              onPress={clear}
              isDisabled={count === 0}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-300 outline-none transition hover:bg-white/10 disabled:cursor-default disabled:text-slate-600 disabled:hover:bg-transparent data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent/70"
            >
              Show all
            </Button>
          </div>
          <ListBox
            selectionMode="multiple"
            selectedKeys={favorites}
            onSelectionChange={handleSelectionChange}
            aria-label="Sportsbooks"
            className="max-h-72 overflow-auto p-1 outline-none"
          >
            {BOOKMAKERS.map((book) => (
              <ListBoxItem
                key={book.key}
                id={book.key}
                textValue={book.title}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition hovered:bg-white/10 focused:bg-white/10 selected:text-accent"
              >
                {({ isSelected }) => (
                  <>
                    <span>{book.title}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 shrink-0 ${isSelected ? 'text-accent-soft' : 'text-slate-600'}`}
                      fill={isSelected ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
                    </svg>
                  </>
                )}
              </ListBoxItem>
            ))}
          </ListBox>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

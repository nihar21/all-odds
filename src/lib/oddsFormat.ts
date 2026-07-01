/**
 * Persistence for the user's preferred odds display format (American / decimal
 * / implied probability). Mirrors `lib/favoriteBooks.ts`: a tiny external store
 * over `localStorage` behind a small function surface, consumed via
 * `useOddsFormat`.
 */
import type { OddsFormat } from './odds';

const STORAGE_KEY = 'allodds:odds-format';
const DEFAULT_FORMAT: OddsFormat = 'american';
const VALID_FORMATS: readonly OddsFormat[] = ['american', 'decimal', 'percent'];

type Listener = () => void;

const listeners = new Set<Listener>();

let snapshot: OddsFormat = readFromStorage();

function readFromStorage(): OddsFormat {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return (VALID_FORMATS as readonly string[]).includes(raw ?? '')
      ? (raw as OddsFormat)
      : DEFAULT_FORMAT;
  } catch {
    // localStorage unavailable (private mode, blocked).
    return DEFAULT_FORMAT;
  }
}

function persist(format: OddsFormat): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, format);
  } catch {
    // Best-effort: if persistence fails we still keep the in-memory snapshot so
    // the current session behaves correctly.
  }
}

function commit(format: OddsFormat): void {
  if (format === snapshot) return;
  snapshot = format;
  persist(format);
  for (const listener of listeners) listener();
}

/** Current preferred odds format. Returns a stable reference between changes. */
export function getOddsFormat(): OddsFormat {
  return snapshot;
}

/** Set the preferred odds format. */
export function setOddsFormat(format: OddsFormat): void {
  commit(format);
}

/** Subscribe to changes; returns an unsubscribe function. */
export function subscribeOddsFormat(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Cross-tab sync: another tab writing the key fires a `storage` event here.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    commit(readFromStorage());
  });
}

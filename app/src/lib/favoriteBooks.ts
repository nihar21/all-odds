/**
 * Persistence for the user's favorite sportsbooks.
 *
 * This is a tiny external store over `localStorage` kept deliberately behind a
 * small function surface so the persistence layer can be swapped later (e.g. a
 * GraphQL backend, see issue #17) without touching the React components that
 * consume it via `useFavoriteBooks`.
 *
 * State is a list of bookmaker keys (matching `BOOKMAKERS[].key`). An empty list
 * means "no favorites" — the app then shows all books (the sensible default).
 */

const STORAGE_KEY = 'allodds:favorite-books';

type Listener = () => void;

const listeners = new Set<Listener>();

// Stable in-memory snapshot. `useSyncExternalStore` compares the snapshot by
// reference, so we only ever replace this array when the value actually changes
// — otherwise React would loop on every render.
let snapshot: string[] = readFromStorage();

/** Safely read + parse the persisted list, tolerating unavailable storage. */
function readFromStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k): k is string => typeof k === 'string');
  } catch {
    // localStorage unavailable (private mode, blocked) or malformed JSON.
    return [];
  }
}

/** Two key lists are "equal" if same length and same order of keys. */
function sameKeys(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((k, i) => k === b[i]);
}

function persist(keys: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // Best-effort: if persistence fails we still keep the in-memory snapshot so
    // the current session behaves correctly.
  }
}

function commit(keys: string[]): void {
  if (sameKeys(keys, snapshot)) return;
  snapshot = keys;
  persist(keys);
  for (const listener of listeners) listener();
}

/** Current favorite book keys. Returns a stable reference between changes. */
export function getFavoriteBooks(): string[] {
  return snapshot;
}

/** Replace the entire favorites list (de-duped, order preserved). */
export function setFavoriteBooks(keys: string[]): void {
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const k of keys) {
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(k);
    }
  }
  commit(deduped);
}

/** Add a book if absent, remove it if present. */
export function toggleFavoriteBook(key: string): void {
  if (snapshot.includes(key)) {
    commit(snapshot.filter((k) => k !== key));
  } else {
    commit([...snapshot, key]);
  }
}

/** Clear all favorites (back to "show all books"). */
export function clearFavoriteBooks(): void {
  commit([]);
}

/** Subscribe to changes; returns an unsubscribe function. */
export function subscribeFavoriteBooks(listener: Listener): () => void {
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

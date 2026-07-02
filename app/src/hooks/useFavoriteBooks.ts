import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  clearFavoriteBooks,
  getFavoriteBooks,
  setFavoriteBooks,
  subscribeFavoriteBooks,
  toggleFavoriteBook,
} from '../lib/favoriteBooks';

export interface UseFavoriteBooks {
  /** Favorite book keys as a Set for O(1) membership checks. */
  favorites: Set<string>;
  /** Favorite book keys as an ordered list. */
  favoriteList: string[];
  isFavorite: (key: string) => boolean;
  toggle: (key: string) => void;
  setFavorites: (keys: string[]) => void;
  clear: () => void;
}

/**
 * React binding for the favorite-books store. Backed by `useSyncExternalStore`
 * so every consumer stays in sync (including across browser tabs).
 */
export function useFavoriteBooks(): UseFavoriteBooks {
  const favoriteList = useSyncExternalStore(
    subscribeFavoriteBooks,
    getFavoriteBooks,
    getFavoriteBooks,
  );

  // Keyed on the snapshot reference (stable between actual changes).
  const favorites = useMemo(() => new Set(favoriteList), [favoriteList]);

  const isFavorite = useCallback((key: string) => favorites.has(key), [favorites]);

  return {
    favorites,
    favoriteList,
    isFavorite,
    toggle: toggleFavoriteBook,
    setFavorites: setFavoriteBooks,
    clear: clearFavoriteBooks,
  };
}

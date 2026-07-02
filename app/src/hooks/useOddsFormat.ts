import { useSyncExternalStore } from 'react';
import type { OddsFormat } from '../lib/odds';
import { getOddsFormat, setOddsFormat, subscribeOddsFormat } from '../lib/oddsFormat';

export interface UseOddsFormat {
  format: OddsFormat;
  setFormat: (format: OddsFormat) => void;
}

/**
 * React binding for the preferred-odds-format store. Backed by
 * `useSyncExternalStore` so every consumer (odds tables, the Settings page)
 * stays in sync, including across browser tabs.
 */
export function useOddsFormat(): UseOddsFormat {
  const format = useSyncExternalStore(subscribeOddsFormat, getOddsFormat, getOddsFormat);

  return { format, setFormat: setOddsFormat };
}

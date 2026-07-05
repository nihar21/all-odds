import { useEffect, useState } from 'react';
import { fetchEspnLogo } from '../lib/espnLogos';
import { PLACEHOLDER_LOGO, logoFor } from '../lib/logos';

interface TeamLogoProps {
  team?: string;
  /** the-odds-api sport_key, used to look up an ESPN runtime fallback when
   * the team has no entry in the bundled manifest. */
  sportKey?: string;
  /** Pixel size of the square logo. Defaults to 24. */
  size?: number;
  className?: string;
}

/**
 * Renders a team's bundled logo, lazily loaded, with a graceful fallback to a
 * neutral placeholder when the team is undefined, unmatched, or the image fails
 * to load. Never throws.
 *
 * When the bundled manifest has no entry and `sportKey` is given, falls back
 * to fetching the logo from ESPN at runtime (see lib/espnLogos.ts).
 */
export function TeamLogo({ team, sportKey, size = 24, className = '' }: TeamLogoProps) {
  const resolved = logoFor(team);
  const [src, setSrc] = useState(resolved);

  // Re-sync if the team prop changes (e.g. card reused for a new event).
  useEffect(() => {
    setSrc(resolved);
    if (resolved !== PLACEHOLDER_LOGO || !team || !sportKey) return;

    let cancelled = false;
    fetchEspnLogo(sportKey, team).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [resolved, team, sportKey]);

  return (
    <img
      src={src}
      alt={team ? `${team} logo` : ''}
      width={size}
      height={size}
      loading="lazy"
      className={`inline-block shrink-0 rounded-full bg-white/5 object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        if (src !== PLACEHOLDER_LOGO) setSrc(PLACEHOLDER_LOGO);
      }}
    />
  );
}

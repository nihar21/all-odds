import { useEffect, useState } from 'react';

interface BookLogoProps {
  /** Sportsbook display name, used as the accessible name and text fallback. */
  title: string;
  /** Root-absolute path to a bundled logo asset, if known. */
  src?: string;
  /** Pixel height of the logo. Defaults to 20. */
  size?: number;
  className?: string;
  /**
   * Set when a visible text label with the same title already sits alongside
   * the logo (e.g. the favorite-books list), so the image shouldn't also
   * contribute its own accessible name and double up the announcement.
   */
  decorative?: boolean;
}

/**
 * Renders a sportsbook's bundled logo with an accessible name equal to its
 * title, falling back to the plain text title when no logo is bundled for
 * this book or the image fails to load. Never throws.
 */
export function BookLogo({
  title,
  src,
  size = 20,
  className = '',
  decorative = false,
}: BookLogoProps) {
  const [failed, setFailed] = useState(false);

  // Re-arm the fallback if the book (and therefore its logo) changes.
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return decorative ? null : (
      <span
        className={`inline-flex items-center justify-center truncate text-xs font-semibold text-slate-300 ${className}`}
        style={{ height: size }}
      >
        {title}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : title}
      aria-hidden={decorative || undefined}
      title={title}
      width={size}
      height={size}
      loading="lazy"
      className={`inline-block shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}

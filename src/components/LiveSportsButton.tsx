import { Link } from 'react-router-dom';

/**
 * Call-to-action linking to the cross-sport live games view. Surfaced on the
 * home page so users can jump straight to whatever is in progress right now.
 */
export function LiveSportsButton() {
  return (
    <Link
      to="/live"
      className="group inline-flex items-center gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 font-semibold text-rose-200 transition hover:-translate-y-0.5 hover:border-rose-400/50 hover:bg-rose-500/15 hover:shadow-glow"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
      </span>
      Live Sports
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-rose-300/70 transition group-hover:translate-x-0.5 group-hover:text-rose-200"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

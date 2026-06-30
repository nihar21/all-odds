import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2.5 rounded-lg px-1 py-1 transition"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-deep text-ink-950 shadow-glow">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 17l5-5 4 4 8-8" />
                <path d="M16 8h5v5" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              All<span className="text-accent">Odds</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            <Link
              to="/"
              aria-current={pathname === '/' ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 font-medium transition hover:bg-white/5 ${
                pathname === '/' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Sports
            </Link>
            <Link
              to="/live"
              aria-current={pathname === '/live' ? 'page' : undefined}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium transition hover:bg-white/5 ${
                pathname === '/live' ? 'text-white' : 'text-slate-400'
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              Live
            </Link>
            <a
              href="https://the-odds-api.com/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg px-3 py-2 font-medium text-slate-400 transition hover:bg-white/5 sm:block"
            >
              Data
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children ?? <Outlet />}
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto w-full max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          Odds for entertainment only · Data via{' '}
          <a
            href="https://the-odds-api.com/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline-offset-2 hover:text-accent hover:underline"
          >
            the-odds-api
          </a>
          . 21+. Please gamble responsibly.
        </div>
      </footer>
    </div>
  );
}

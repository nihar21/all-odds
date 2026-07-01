import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SportsMenu } from './SportsMenu';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-1.5">
            <SportsMenu />
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
          </div>

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
            <Link
              to="/settings"
              aria-current={pathname === '/settings' ? 'page' : undefined}
              aria-label="Settings"
              className={`rounded-lg p-2 transition hover:bg-white/5 ${
                pathname === '/settings' ? 'text-white' : 'text-slate-400'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
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
          <span className="mx-2 text-slate-700">·</span>
          <span className="text-slate-600">
            v{__APP_VERSION__} · {__COMMIT_HASH__}
          </span>
        </div>
      </footer>
    </div>
  );
}

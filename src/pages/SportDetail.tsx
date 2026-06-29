import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSportsList } from '../lib/api';
import { useAsync } from '../hooks/useAsync';
import { sportIcon } from '../constants';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CardGridSkeleton } from '../components/Skeleton';
import { ErrorView } from '../components/ErrorView';

export function SportDetail() {
  // React Router already URL-decodes route params, so use `group` directly.
  const { group: groupName = '' } = useParams();
  const { data, loading, error } = useAsync(getSportsList, []);

  const leagues = useMemo(
    () => (data ?? []).filter((s) => s.group === groupName),
    [data, groupName],
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sports', to: '/' }, { label: groupName }]} />

      <div className="mb-8 flex items-center gap-3 animate-fade-up">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-2xl">
          {sportIcon(groupName)}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {groupName}
          </h1>
          <p className="text-sm text-slate-400">Choose a league to compare odds.</p>
        </div>
      </div>

      {loading && <CardGridSkeleton count={6} />}

      {error && (
        <ErrorView
          title="Couldn't load leagues"
          message={`${error} The odds API may be rate-limited — try again shortly.`}
        />
      )}

      {!loading && !error && leagues.length === 0 && (
        <ErrorView
          title="No leagues here"
          message={`We couldn't find any leagues under “${groupName}”.`}
        />
      )}

      {!loading && !error && leagues.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league, i) => (
            <li
              key={league.key}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <Link
                to={`/sport/${encodeURIComponent(groupName)}/league/${league.key}`}
                className="card-surface group flex h-full items-center justify-between gap-3 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold text-white">
                      {league.title}
                    </span>
                    {league.active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" title="Active" />
                    )}
                  </div>
                  {league.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {league.description}
                    </p>
                  )}
                </div>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-accent"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

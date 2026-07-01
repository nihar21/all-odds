import { Link } from 'react-router-dom';

interface ErrorViewProps {
  title?: string;
  message: string;
}

export function ErrorView({ title = 'Something went wrong', message }: ErrorViewProps) {
  return (
    <div className="card-surface mx-auto max-w-lg animate-fade-up p-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-500/15 text-rose-300">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
      >
        ← Back to sports
      </Link>
    </div>
  );
}

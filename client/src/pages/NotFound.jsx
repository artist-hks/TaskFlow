import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark">
        <Compass size={30} />
      </div>
      <h1 className="text-[48px] font-semibold leading-none tracking-tight text-ink dark:text-ink-dark">
        404
      </h1>
      <p className="mt-3 max-w-xs text-sm text-muted dark:text-muted-dark">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-primary mt-7">
        Back to dashboard
      </Link>
    </div>
  );
}

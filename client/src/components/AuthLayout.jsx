import { CheckSquare } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white dark:bg-accent-dark">
            <CheckSquare size={24} />
          </span>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-muted dark:text-muted-dark">
            {subtitle}
          </p>
        </div>
        <div className="card p-7">{children}</div>
      </div>
    </div>
  );
}

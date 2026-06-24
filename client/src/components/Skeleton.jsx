export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-hairline/50 dark:bg-hairline-dark/50 ${className}`}
    />
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="card p-6">
      <Skeleton className="mb-3 h-5 w-2/3" />
      <Skeleton className="mb-2 h-3.5 w-full" />
      <Skeleton className="mb-5 h-3.5 w-4/5" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="mb-3 h-3 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

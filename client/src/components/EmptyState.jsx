import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface/40 px-6 py-16 text-center dark:border-hairline-dark dark:bg-surface-dark/40">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <h3 className="text-[17px] font-semibold text-ink dark:text-ink-dark">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted dark:text-muted-dark">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

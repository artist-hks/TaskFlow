import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidth} animate-[modalin_0.2s_ease] rounded-t-2xl bg-surface shadow-soft-lg sm:rounded-2xl dark:bg-surface-dark`}
      >
        <div className="flex items-center justify-between border-b border-hairline/60 px-6 py-4 dark:border-hairline-dark/60">
          <h2 className="text-[18px] font-semibold text-ink dark:text-ink-dark">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink dark:text-muted-dark dark:hover:bg-canvas-dark dark:hover:text-ink-dark"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

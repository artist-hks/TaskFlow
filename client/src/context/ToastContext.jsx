import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const config = {
    success: { Icon: CheckCircle2, color: 'text-success' },
    error: { Icon: AlertCircle, color: 'text-danger' },
    info: { Icon: Info, color: 'text-accent dark:text-accent-dark' },
  }[toast.type];

  const { Icon, color } = config;

  return (
    <div className="pointer-events-auto flex w-72 items-start gap-3 rounded-2xl bg-surface px-4 py-3 shadow-soft-lg ring-1 ring-hairline/60 animate-[slidein_0.2s_ease] dark:bg-surface-dark dark:ring-hairline-dark/60">
      <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
      <p className="flex-1 text-sm text-ink dark:text-ink-dark">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

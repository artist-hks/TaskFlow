import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Custom <Select> that replaces the native <select> with a fully-styled
 * dropdown panel featuring rounded corners, smooth animation, and consistent
 * spacing — matching the Apple-clean design language.
 */
export default function Select({
  value,
  onChange,
  options,          // [{ value, label }]
  placeholder,
  className = '',
  icon: Icon,       // optional leading icon (Lucide component)
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label || placeholder || 'Select…';

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`input flex w-full items-center justify-between gap-2 text-left ${
          Icon ? 'pl-9' : ''
        }`}
      >
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark"
          />
        )}
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted/60 transition-transform duration-200 dark:text-muted-dark/60 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-56 w-full overflow-auto rounded-xl bg-surface py-1 shadow-soft-lg ring-1 ring-hairline/60 dark:bg-surface-dark dark:ring-hairline-dark/60"
          style={{ animation: 'selectFadeIn 150ms ease-out' }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3.5 py-2 text-sm transition-colors duration-100 ${
                opt.value === value
                  ? 'bg-accent/8 font-medium text-accent dark:bg-accent-dark/12 dark:text-accent-dark'
                  : 'text-ink hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark'
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

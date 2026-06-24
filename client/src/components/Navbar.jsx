import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, LayoutGrid, ChevronDown, CheckSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials =
    user?.name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-40 border-b border-hairline/60 bg-canvas/70 backdrop-blur-xl backdrop-saturate-150 dark:border-hairline-dark/60 dark:bg-canvas-dark/70">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-ink dark:text-ink-dark"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white dark:bg-accent-dark">
            <CheckSquare size={18} />
          </span>
          TaskFlow
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors duration-150 ease-apple hover:bg-surface hover:text-ink dark:text-muted-dark dark:hover:bg-surface-dark dark:hover:text-ink-dark"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors duration-150 ease-apple hover:bg-surface dark:hover:bg-surface-dark"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-[13px] font-semibold text-accent dark:bg-accent-dark/15 dark:text-accent-dark">
                {initials}
              </span>
              <ChevronDown size={15} className="text-muted dark:text-muted-dark" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-surface shadow-soft-lg ring-1 ring-hairline/60 dark:bg-surface-dark dark:ring-hairline-dark/60">
                <div className="border-b border-hairline/60 px-4 py-3 dark:border-hairline-dark/60">
                  <p className="truncate text-sm font-medium text-ink dark:text-ink-dark">
                    {user?.name}
                  </p>
                  <p className="truncate text-[13px] text-muted dark:text-muted-dark">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark"
                >
                  <LayoutGrid size={16} className="text-muted dark:text-muted-dark" />
                  My Boards
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/5"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2, Layers } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils.js';

export default function BoardCard({ board, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div
      onClick={() => navigate(`/boards/${board._id}`)}
      className="card group cursor-pointer p-6 transition-all duration-200 ease-apple hover:shadow-soft-lg hover:-translate-y-0.5"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark">
          <Layers size={18} />
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted opacity-0 transition-all duration-150 hover:bg-canvas hover:text-ink group-hover:opacity-100 dark:text-muted-dark dark:hover:bg-canvas-dark dark:hover:text-ink-dark"
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl bg-surface shadow-soft-lg ring-1 ring-hairline/60 dark:bg-surface-dark dark:ring-hairline-dark/60">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(board);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink transition-colors hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark"
              >
                <Pencil size={15} className="text-muted dark:text-muted-dark" />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(board);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-danger transition-colors hover:bg-danger/5"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-[17px] font-semibold text-ink dark:text-ink-dark">
        {board.title}
      </h3>
      {board.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted dark:text-muted-dark">
          {board.description}
        </p>
      ) : (
        <p className="mt-1 text-sm italic text-muted/70 dark:text-muted-dark/70">
          No description
        </p>
      )}

      <div className="mt-5 flex items-center justify-between text-[12px] font-medium text-muted dark:text-muted-dark">
        <span>
          {board.taskCount ?? 0} {board.taskCount === 1 ? 'task' : 'tasks'}
        </span>
        <span>Updated {formatDate(board.updatedAt)}</span>
      </div>
    </div>
  );
}

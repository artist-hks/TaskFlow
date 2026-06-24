import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { priorityStyles, formatDate, isOverdue, COLUMNS } from '../utils.js';

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = task.status !== 'done' && isOverdue(task.dueDate);
  const [moveOpen, setMoveOpen] = useState(false);
  const moveRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (moveRef.current && !moveRef.current.contains(e.target)) {
        setMoveOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card group relative p-4 ${
        overdue ? 'border-l-4 border-l-danger' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 cursor-grab text-muted/40 transition-colors duration-150 hover:text-muted/70 active:cursor-grabbing dark:text-muted-dark/40 dark:hover:text-muted-dark/70 sm:block"
        aria-label="Drag task"
      >
        <GripVertical size={16} />
      </button>

      <div className="sm:pl-6">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[14px] font-medium leading-snug text-ink dark:text-ink-dark">
            {task.title}
          </h4>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <button
              onClick={() => onEdit(task)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink dark:text-muted-dark dark:hover:bg-canvas-dark dark:hover:text-ink-dark"
              aria-label="Edit task"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger dark:text-muted-dark"
              aria-label="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted dark:text-muted-dark">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>

          {task.estimatedEffort && (
            <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted dark:bg-canvas-dark dark:text-muted-dark">
              <Clock size={11} />
              {task.estimatedEffort}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                overdue
                  ? 'bg-danger/10 text-danger'
                  : 'bg-canvas text-muted dark:bg-canvas-dark dark:text-muted-dark'
              }`}
            >
              {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Accessible / mobile move control (fallback for drag-and-drop) */}
        <div className="relative mt-2 sm:hidden" ref={moveRef}>
          <button
            onClick={() => setMoveOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-accent dark:text-accent-dark"
          >
            Move <ChevronRight size={13} />
          </button>
          {moveOpen && (
            <div className="absolute z-10 mt-1 w-40 overflow-hidden rounded-xl bg-surface shadow-soft-lg ring-1 ring-hairline/60 dark:bg-surface-dark dark:ring-hairline-dark/60">
              {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMoveOpen(false);
                    onMove(task, c.id);
                  }}
                  className="block w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

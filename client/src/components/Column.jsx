import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard.jsx';

const dotColors = {
  todo: 'bg-accent dark:bg-accent-dark',
  'in-progress': 'bg-warning',
  done: 'bg-success',
};

export default function Column({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-[300px] shrink-0 flex-col sm:w-auto sm:flex-1">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColors[column.id]}`} />
          <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">
            {column.label}
          </h3>
          <span className="rounded-full bg-canvas px-1.5 py-0.5 text-[11px] font-semibold text-muted dark:bg-surface-dark dark:text-muted-dark">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-accent dark:text-muted-dark dark:hover:bg-surface-dark dark:hover:text-accent-dark"
          aria-label={`Add task to ${column.label}`}
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2.5 rounded-2xl p-2 transition-colors duration-150 ease-apple ${
          isOver
            ? 'bg-accent/5 ring-2 ring-inset ring-accent/30 dark:bg-accent-dark/10 dark:ring-accent-dark/30'
            : 'bg-canvas/60 dark:bg-surface-dark/40'
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            onClick={() => onAddTask(column.id)}
            className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-hairline py-6 text-[13px] text-muted transition-colors hover:border-accent hover:text-accent dark:border-hairline-dark dark:text-muted-dark dark:hover:border-accent-dark dark:hover:text-accent-dark"
          >
            + Add a task
          </button>
        )}
      </div>
    </div>
  );
}

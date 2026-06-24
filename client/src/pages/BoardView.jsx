import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft, Plus, ListTodo } from 'lucide-react';

import api, { apiError } from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import { COLUMNS, isOverdue } from '../utils.js';
import Column from '../components/Column.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import FilterBar from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { TaskCardSkeleton } from '../components/Skeleton.jsx';

export default function BoardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // modal / dialog state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // filters
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [sort, setSort] = useState('created');

  // drag
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    })
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [boardRes, tasksRes] = await Promise.all([
        api.get(`/boards/${id}`),
        api.get(`/boards/${id}/tasks`),
      ]);
      setBoard(boardRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      setError(apiError(err, 'Could not load this board'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Filtering + sorting (applied per column) ----
  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }
    if (priority !== 'all') {
      list = list.filter((t) => t.priority === priority);
    }
    if (sort === 'due-asc' || sort === 'due-desc') {
      list.sort((a, b) => {
        const av = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bv = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return sort === 'due-asc' ? av - bv : bv - av;
      });
    } else {
      list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return list;
  }, [tasks, search, priority, sort]);

  const tasksByColumn = useMemo(() => {
    const map = { todo: [], 'in-progress': [], done: [] };
    for (const t of filteredTasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [filteredTasks]);

  // ---- Task CRUD ----
  const openCreate = (status = 'todo') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setTaskModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const submitTask = async (payload) => {
    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? data.data : t))
        );
        toast.success('Task updated');
      } else {
        const { data } = await api.post(`/boards/${id}/tasks`, payload);
        setTasks((prev) => [...prev, data.data]);
        toast.success('Task created');
      }
    } catch (err) {
      throw new Error(apiError(err, 'Could not save task'));
    }
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tasks/${deletingTask._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== deletingTask._id));
      toast.success('Task deleted');
      setDeletingTask(null);
    } catch (err) {
      toast.error(apiError(err, 'Could not delete task'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---- Status change (used by dnd + mobile dropdown) ----
  const moveTask = async (task, newStatus) => {
    if (task.status === newStatus) return;
    const prev = tasks;
    // optimistic update
    setTasks((p) =>
      p.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
    } catch (err) {
      setTasks(prev); // rollback
      toast.error(apiError(err, 'Could not move task'));
    }
  };

  // ---- Drag handlers ----
  const handleDragStart = (event) => {
    const t = tasks.find((x) => x._id === event.active.id);
    setActiveTask(t || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const activeTaskObj = tasks.find((t) => t._id === activeId);
    if (!activeTaskObj) return;

    // Determine the target column: over.id is either a column id or a task id.
    let targetStatus = over.id;
    if (!COLUMNS.some((c) => c.id === over.id)) {
      const overTask = tasks.find((t) => t._id === over.id);
      targetStatus = overTask?.status;
    }
    if (!targetStatus) return;

    if (targetStatus !== activeTaskObj.status) {
      moveTask(activeTaskObj, targetStatus);
    } else if (activeId !== over.id) {
      // Reorder within the same column (client-side only).
      setTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t._id === activeId);
        const newIndex = prev.findIndex((t) => t._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const totalTasks = tasks.length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'done' && isOverdue(t.dueDate)
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
      >
        <ArrowLeft size={16} /> Boards
      </Link>

      {loading ? (
        <BoardSkeleton />
      ) : error ? (
        <div className="rounded-2xl bg-danger/10 px-5 py-4 text-sm text-danger">
          {error}{' '}
          <button onClick={load} className="font-medium underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                {board?.title}
              </h1>
              {board?.description && (
                <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                  {board.description}
                </p>
              )}
              <p className="mt-2 text-[13px] text-muted dark:text-muted-dark">
                {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                {overdueCount > 0 && (
                  <span className="ml-2 font-medium text-danger">
                    · {overdueCount} overdue
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => openCreate('todo')}
              className="btn-primary self-start sm:self-auto"
            >
              <Plus size={18} /> New task
            </button>
          </div>

          <div className="mb-6">
            <FilterBar
              search={search}
              onSearch={setSearch}
              priority={priority}
              onPriority={setPriority}
              sort={sort}
              onSort={setSort}
            />
          </div>

          {totalTasks === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No tasks yet"
              description="Add your first task to start tracking work across the To Do, In Progress, and Done columns."
              actionLabel="Add a task"
              onAction={() => openCreate('todo')}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveTask(null)}
            >
              <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
                {COLUMNS.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasksByColumn[column.id]}
                    onAddTask={openCreate}
                    onEditTask={openEdit}
                    onDeleteTask={setDeletingTask}
                    onMoveTask={moveTask}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeTask ? (
                  <div className="w-[280px] rotate-2 opacity-90">
                    <TaskCard
                      task={activeTask}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onMove={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={submitTask}
        task={editingTask}
        defaultStatus={defaultStatus}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={confirmDeleteTask}
        title="Delete task?"
        message={`"${deletingTask?.title}" will be permanently deleted.`}
        loading={deleteLoading}
      />
    </main>
  );
}

function BoardSkeleton() {
  return (
    <div>
      <div className="mb-6 h-8 w-48 animate-pulse rounded-xl bg-hairline/50 dark:bg-hairline-dark/50" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((c) => (
          <div key={c.id} className="space-y-2.5">
            <div className="h-5 w-24 animate-pulse rounded-lg bg-hairline/50 dark:bg-hairline-dark/50" />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

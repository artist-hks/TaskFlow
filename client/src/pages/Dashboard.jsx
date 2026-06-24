import { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import api, { apiError } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import BoardCard from '../components/BoardCard.jsx';
import BoardModal from '../components/BoardModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DashboardCharts from '../components/DashboardCharts.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { BoardCardSkeleton } from '../components/Skeleton.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [boards, setBoards] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/boards');
      const list = data.data;
      setBoards(list);

      // Pull tasks across all boards for the analytics charts.
      const taskResults = await Promise.all(
        list.map((b) =>
          api
            .get(`/boards/${b._id}/tasks`)
            .then((r) => r.data.data)
            .catch(() => [])
        )
      );
      setAllTasks(taskResults.flat());
    } catch (err) {
      setError(apiError(err, 'Could not load your boards'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = () => {
    setEditingBoard(null);
    setModalOpen(true);
  };

  const handleEdit = (board) => {
    setEditingBoard(board);
    setModalOpen(true);
  };

  const submitBoard = async (payload) => {
    try {
      if (editingBoard) {
        await api.put(`/boards/${editingBoard._id}`, payload);
        toast.success('Board updated');
      } else {
        await api.post('/boards', payload);
        toast.success('Board created');
      }
      await load();
    } catch (err) {
      throw new Error(apiError(err, 'Could not save board'));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/boards/${deleting._id}`);
      toast.success('Board deleted');
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(apiError(err, 'Could not delete board'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            Here's an overview of your boards and tasks.
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary self-start sm:self-auto">
          <Plus size={18} />
          New board
        </button>
      </div>

      {/* Analytics */}
      {!loading && !error && (boards.length > 0 || allTasks.length > 0) && (
        <section className="mb-10">
          <DashboardCharts tasks={allTasks} />
        </section>
      )}

      {/* Boards */}
      <section>
        <h2 className="mb-4 text-[18px] font-semibold text-ink dark:text-ink-dark">
          Your boards
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-danger/10 px-5 py-4 text-sm text-danger">
            {error}{' '}
            <button onClick={load} className="font-medium underline">
              Retry
            </button>
          </div>
        ) : boards.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No boards yet"
            description="Create your first board to start organizing tasks into columns."
            actionLabel="Create your first board"
            onAction={handleCreate}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardCard
                key={board._id}
                board={board}
                onEdit={handleEdit}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </section>

      <BoardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitBoard}
        board={editingBoard}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete board?"
        message={`"${deleting?.title}" and all of its tasks will be permanently deleted. This cannot be undone.`}
        loading={deleteLoading}
      />
    </main>
  );
}

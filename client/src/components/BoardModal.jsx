import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function BoardModal({ open, onClose, onSubmit, board }) {
  const isEdit = Boolean(board);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: board?.title || '',
        description: board?.description || '',
      });
      setError('');
    }
  }, [open, board]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Board title is required');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not save board');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Rename board' : 'New board'}
      maxWidth="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <div>
          <label className="label">Title</label>
          <input
            autoFocus
            className="input"
            placeholder="e.g. Product Launch"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Description (optional)</label>
          <textarea
            rows={3}
            className="input resize-none"
            placeholder="What is this board for?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save' : 'Create board'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

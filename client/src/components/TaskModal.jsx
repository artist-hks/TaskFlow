import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, X, WifiOff } from 'lucide-react';
import Modal from './Modal.jsx';
import Select from './Select.jsx';
import api, { apiError } from '../api/axios.js';
import { PRIORITIES, COLUMNS, toDateInput } from '../utils.js';

const statusOptions = COLUMNS.map((c) => ({ value: c.id, label: c.label }));
const priorityOptions = PRIORITIES.map((p) => ({ value: p.value, label: p.label }));

const emptyForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  estimatedEffort: '',
};

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  task,
  defaultStatus = 'todo',
}) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(
        task
          ? {
              title: task.title || '',
              description: task.description || '',
              status: task.status || 'todo',
              priority: task.priority || 'medium',
              dueDate: toDateInput(task.dueDate),
              estimatedEffort: task.estimatedEffort || '',
            }
          : { ...emptyForm, status: defaultStatus }
      );
      setError('');
      setAiError('');
      setSuggestion(null);
    }
  }, [open, task, defaultStatus]);

  const requestSuggestion = async () => {
    if (!form.title.trim()) {
      setAiError('Add a title first so the AI has something to work with.');
      return;
    }
    setAiError('');
    setAiLoading(true);
    setSuggestion(null);
    try {
      const { data } = await api.post('/ai/suggest', {
        title: form.title.trim(),
        description: form.description.trim(),
      });
      setSuggestion(data.data);
    } catch (err) {
      setAiError(apiError(err, 'Could not get a suggestion'));
    } finally {
      setAiLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    setForm((f) => ({
      ...f,
      estimatedEffort: suggestion.effort || f.estimatedEffort,
      dueDate: suggestion.suggestedDueDate
        ? toDateInput(suggestion.suggestedDueDate)
        : f.dueDate,
    }));
    setSuggestion(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        estimatedEffort: form.estimatedEffort.trim(),
        dueDate: form.dueDate || '',
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'New task'}
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
            placeholder="e.g. Write launch announcement"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={3}
            className="input resize-none"
            placeholder="Add more detail…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* AI suggestion */}
        <div>
          <button
            type="button"
            onClick={requestSuggestion}
            disabled={aiLoading}
            className="btn-ghost px-0 text-[13px]"
          >
            {aiLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {aiLoading ? 'Thinking…' : '✨ Suggest estimate'}
          </button>

          {aiError && (
            <p className="mt-1 text-[12px] text-danger">{aiError}</p>
          )}

          {suggestion && (
            <div className="mt-2 rounded-xl bg-accent/5 p-3.5 ring-1 ring-accent/15 dark:bg-accent-dark/10 dark:ring-accent-dark/20">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-accent dark:text-accent-dark">
                  <Sparkles size={14} /> AI estimate
                </span>
                {suggestion.fallback && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                    <WifiOff size={10} /> Offline estimate
                  </span>
                )}
              </div>
              <div className="space-y-1 text-[13px] text-ink dark:text-ink-dark">
                <p>
                  <span className="text-muted dark:text-muted-dark">Effort:</span>{' '}
                  <span className="font-medium">{suggestion.effort}</span>
                </p>
                {suggestion.suggestedDueDate && (
                  <p>
                    <span className="text-muted dark:text-muted-dark">
                      Suggested due:
                    </span>{' '}
                    <span className="font-medium">
                      {suggestion.suggestedDueDate}
                    </span>
                  </p>
                )}
                {suggestion.reasoning && (
                  <p className="text-muted dark:text-muted-dark">
                    {suggestion.reasoning}
                  </p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  className="btn-primary px-3 py-1.5 text-[13px]"
                >
                  <Check size={14} /> Accept
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestion(null)}
                  className="btn-secondary px-3 py-1.5 text-[13px]"
                >
                  <X size={14} /> Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <Select
              value={form.status}
              onChange={(val) => setForm({ ...form, status: val })}
              options={statusOptions}
              aria-label="Task status"
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <Select
              value={form.priority}
              onChange={(val) => setForm({ ...form, priority: val })}
              options={priorityOptions}
              aria-label="Task priority"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Effort</label>
            <input
              className="input"
              placeholder="e.g. M or 4h"
              value={form.estimatedEffort}
              onChange={(e) =>
                setForm({ ...form, estimatedEffort: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

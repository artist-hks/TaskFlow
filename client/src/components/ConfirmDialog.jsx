import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle size={20} />
        </div>
        <p className="pt-1.5 text-sm text-muted dark:text-muted-dark">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger" disabled={loading}>
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

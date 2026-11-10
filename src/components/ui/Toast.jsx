import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone] || Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <Icon size={18} aria-hidden="true" />
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

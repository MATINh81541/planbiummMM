/*
 * PlanBium toast notification system.
 *
 * RTL-aware, theme-aware toasts positioned bottom-center on mobile and
 * top-end on desktop. Auto-dismisses after 4s, dismissible, accessible.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

const typeConfig: Record<ToastType, { icon: typeof CheckCircle; classes: string }> = {
  success: {
    icon: CheckCircle,
    classes: 'border-lime-400/40 text-lime-700',
  },
  error: {
    icon: AlertCircle,
    classes: 'border-red-400/40 text-red-600',
  },
  info: {
    icon: Info,
    classes: 'border-gray-400/40 text-gray-700',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="fixed z-[100] flex flex-col gap-2 p-3 pointer-events-none
                 bottom-0 inset-x-0 items-center
                 md:top-0 md:bottom-auto md:inset-x-auto md:end-0 md:items-end"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const { icon: Icon, classes } = typeConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`glass-surface rounded-glass shadow-glass border ${classes}
                  pointer-events-auto flex items-center gap-3 px-4 py-3 pe-10
                  animate-fade-in max-w-sm w-full md:w-auto
                  relative`}
      role="alert"
    >
      <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium text-gray-800">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100/40 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

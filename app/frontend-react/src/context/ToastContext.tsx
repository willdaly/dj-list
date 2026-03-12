import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  notify: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            t.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : t.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-gray-200 bg-white text-gray-800'
          }`}
        >
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button
            type="button"
            onClick={() => ctx.dismiss(t.id)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      notify: () => {},
      dismiss: () => {}
    };
  }
  return ctx;
}

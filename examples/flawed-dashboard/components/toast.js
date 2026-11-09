'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [status, setStatus] = useState('');
  const next = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message, { tone = 'success', action } = {}) => {
      const id = next.current++;
      setToasts((t) => [...t, { id, message, tone, action }]);
      if (!action) setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );
  const announce = useCallback((message) => {
    setStatus('');
    setTimeout(() => setStatus(message), 50);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, announce }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">{status}</div>
      <section aria-label="Notifications" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        <div role="status" aria-live="polite" className="flex flex-col gap-2">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm shadow-md">
              <p className={`flex-1 ${t.tone === 'error' ? 'text-critical' : ''}`}>{t.message}</p>
              {t.action && (
                <button type="button" className="font-medium text-accent" onClick={() => { dismiss(t.id); t.action.onClick(); }}>
                  {t.action.label}
                </button>
              )}
              <button type="button" aria-label="Dismiss notification" className="text-muted" onClick={() => dismiss(t.id)}>×</button>
            </div>
          ))}
        </div>
      </section>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

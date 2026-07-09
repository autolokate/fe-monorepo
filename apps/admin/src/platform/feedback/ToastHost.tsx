import { useEffect, useState } from 'react';

import { registerToastListener, type ToastPayload } from '@/platform/feedback/toast';

import './toast.css';

export function ToastHost() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    return registerToastListener((nextToast) => {
      setToast(nextToast);
      window.setTimeout(() => {
        setToast((current) => (current === nextToast ? null : current));
      }, nextToast.durationMs ?? 4200);
    });
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div
      className="admin-toast-host"
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
    >
      <p
        className={`admin-toast admin-toast--${toast.variant}`}
        key={toast.message}
      >
        {toast.variant === 'success' ? (
          <span className="admin-toast__icon" aria-hidden>
            ✓
          </span>
        ) : null}
        {toast.variant === 'error' ? (
          <span className="admin-toast__icon" aria-hidden>
            !
          </span>
        ) : null}
        <span>{toast.message}</span>
      </p>
    </div>
  );
}

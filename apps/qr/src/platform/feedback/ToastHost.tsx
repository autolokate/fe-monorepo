import { useEffect, useState } from 'react';

import { registerToastListener } from './toast.js';

import './toast.css';

const TOAST_DURATION_MS = 5000;

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return registerToastListener((nextMessage) => {
      setMessage(nextMessage);
    });
  }, []);

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setMessage(null);
    }, TOAST_DURATION_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div className="ob-toast-host" role="status" aria-live="polite">
      <p className="ob-toast">{message}</p>
    </div>
  );
}

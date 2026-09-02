import { useEffect, useState } from 'react';

import { registerToastListener } from './toast';

import './toast.css';

const TOAST_DURATION_MS = 4500;
const TOAST_EXIT_MS = 200;

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    return registerToastListener((nextMessage) => {
      setExiting(false);
      setMessage(nextMessage);
    });
  }, []);

  useEffect(() => {
    if (!message || exiting) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setExiting(true);
    }, TOAST_DURATION_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [exiting, message]);

  useEffect(() => {
    if (!exiting) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setMessage(null);
      setExiting(false);
    }, TOAST_EXIT_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [exiting]);

  if (!message) {
    return null;
  }

  return (
    <div className="ob-toast-host" role="alert" aria-live="assertive">
      <div className={`ob-toast${exiting ? ' ob-toast--exit' : ''}`}>
        <span className="ob-toast__icon" aria-hidden>
          !
        </span>
        <p className="ob-toast__message">{message}</p>
      </div>
    </div>
  );
}

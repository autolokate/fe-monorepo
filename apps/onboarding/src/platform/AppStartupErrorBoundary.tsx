import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppStartupErrorBoundaryProps = {
  children: ReactNode;
};

type AppStartupErrorBoundaryState = {
  error: Error | null;
};

async function clearServiceWorkersAndReload(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  window.location.reload();
}

/** Catches startup/render failures — common on mobile when a stale service worker serves old JS. */
export class AppStartupErrorBoundary extends Component<
  AppStartupErrorBoundaryProps,
  AppStartupErrorBoundaryState
> {
  state: AppStartupErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppStartupErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[onboarding] startup error', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          background: '#0a0a0a',
          color: '#f5f5f5',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Autolokate could not start</h1>
        <p style={{ margin: 0, maxWidth: '20rem', lineHeight: 1.5, color: '#a3a3a3' }}>
          This can happen after an app update on mobile. Clear cached data and reload to continue.
        </p>
        <button
          type="button"
          onClick={() => {
            void clearServiceWorkersAndReload();
          }}
          style={{
            border: 0,
            borderRadius: '999px',
            padding: '12px 20px',
            background: '#f5f5f5',
            color: '#0a0a0a',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Clear cache and reload
        </button>
      </div>
    );
  }
}

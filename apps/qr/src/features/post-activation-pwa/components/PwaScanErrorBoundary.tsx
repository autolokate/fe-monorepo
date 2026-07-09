import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlButton, AlHeading, AlText } from '@autolokate/ui';

import { logPhotoDiagnostic, readPhotoDiagnostics } from '../utils/pwa-photo-diagnostics.js';

type PwaScanErrorBoundaryProps = {
  children: ReactNode;
  routeLabel?: string;
};

type PwaScanErrorBoundaryState = {
  error: Error | null;
};

/** Prevents uncaught photo/storage crashes from leaving a blank #root. */
export class PwaScanErrorBoundary extends Component<
  PwaScanErrorBoundaryProps,
  PwaScanErrorBoundaryState
> {
  state: PwaScanErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PwaScanErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logPhotoDiagnostic(this.props.routeLabel ?? 'pwa-scan', 'render_error', {
      message: error.message,
      stack: error.stack?.slice(0, 240) ?? null,
      componentStack: info.componentStack?.slice(0, 240) ?? null,
    });
    if (import.meta.env.DEV) {
      console.error('[pwa-scan-error-boundary]', error, info);
    }
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const diagnostics = readPhotoDiagnostics().slice(-5);

    return (
      <div className="pwa-scan-error-fallback" role="alert">
        <AlHeading variant="h2">Something went wrong</AlHeading>
        <AlText tone="muted">
          The screen could not load after your photo was captured. Your session is still active — try
          again or go back.
        </AlText>
        <p className="pwa-scan-error-fallback__detail">{this.state.error.message}</p>
        {diagnostics.length > 0 ? (
          <pre className="pwa-scan-error-fallback__diag">
            {diagnostics.map((entry) => `${entry.at} · ${entry.routeId} · ${entry.event}`).join('\n')}
          </pre>
        ) : null}
        <AlButton variant="primary" onClick={this.handleRetry}>
          Try again
        </AlButton>
      </div>
    );
  }
}

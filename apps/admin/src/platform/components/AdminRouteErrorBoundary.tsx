import { AlButton } from '@autolokate/ui';
import { TriangleAlert } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  /** Changing this (the pathname) clears a caught error, so navigating away recovers. */
  resetKey: string;
  children: ReactNode;
};

type State = { error: Error | null };

/**
 * Keeps one broken page from blanking the whole console: the shell (nav, palette, sign out) stays
 * usable and the operator gets a retry. Errors still reach the console for debugging.
 */
export class AdminRouteErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[admin] page crashed', error, info.componentStack);
  }

  override componentDidUpdate(previous: Props): void {
    if (previous.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div className="ax-crash" role="alert" data-testid="admin-route-error">
        <TriangleAlert size={22} aria-hidden className="ax-crash__icon" />
        <h2 className="ax-crash__title">This page hit an unexpected error</h2>
        <p className="ax-crash__body">
          Nothing was changed. Try again, or open another page from the sidebar. If it keeps
          happening, share the time and page with engineering.
        </p>
        <AlButton
          variant="secondary"
          size="sm"
          onClick={() => {
            this.setState({ error: null });
          }}
        >
          Try again
        </AlButton>
      </div>
    );
  }
}

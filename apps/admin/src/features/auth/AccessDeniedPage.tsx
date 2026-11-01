import { AlButton } from '@autolokate/ui';

import { useAdminAuth } from '@/providers/AdminAuthProvider';

/**
 * Shown when the signed-in account's active role is not OPERATOR. The server would refuse every
 * admin call, so the console shell is never rendered for such a session.
 */
export function AccessDeniedPage() {
  const { session, signOut } = useAdminAuth();
  return (
    <div className="admin-login-page" data-testid="admin-access-denied">
      <div className="admin-login-card admin-panel">
        <header className="admin-login-brand">
          <p className="admin-login-brand__name">Autolokate</p>
          <h1 className="admin-login-brand__title">No admin access</h1>
          <p className="admin-login-brand__subtitle">
            This account is signed in as <strong>{session?.role ?? 'unknown'}</strong>. The Admin
            console is only available to accounts with the OPERATOR role. Ask a platform
            administrator to grant it, then sign in again.
          </p>
        </header>
        <div className="admin-login-form">
          <AlButton
            onClick={() => {
              void signOut();
            }}
          >
            Sign out
          </AlButton>
        </div>
      </div>
    </div>
  );
}

import { AlPageContent, AlPageLayout, AlText } from '@autolokate/ui';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AdminCommandPalette } from '@/components/AdminCommandPalette';
import { AdminHeader } from '@/layouts/AdminHeader';
import { AdminSidebar } from '@/layouts/AdminSidebar';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

export function AdminShellLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { isAuthenticated, hasAdminPlaneRole, session } = useAdminAuth();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="admin-shell-backdrop is-visible"
          aria-label="Close navigation"
          onClick={() => {
            setMobileOpen(false);
          }}
        />
      ) : null}
      <AlPageLayout
        sidebarClassName={mobileOpen ? 'is-mobile-open' : undefined}
        sidebar={
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={() => {
              setCollapsed((value) => !value);
            }}
            onNavigate={() => {
              setMobileOpen(false);
            }}
          />
        }
        header={
          <AdminHeader
            onOpenCommandPalette={() => {
              setCommandOpen(true);
            }}
            onOpenMobileNav={() => {
              setMobileOpen(true);
            }}
          />
        }
      >
        <AlPageContent maxWidth="xl">
          {isAuthenticated && !hasAdminPlaneRole ? (
            <div
              className="admin-shell-role-banner"
              data-testid="admin-plane-role-missing"
              role="status"
            >
              <AlText variant="caption" tone="muted">
                Session role <strong>{session?.role ?? 'unknown'}</strong> — Admin APIs need{' '}
                <strong>OPERATOR</strong> + step_up. Reads that require elevation will return 403.
              </AlText>
            </div>
          ) : null}
          <Outlet />
        </AlPageContent>
      </AlPageLayout>
      <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

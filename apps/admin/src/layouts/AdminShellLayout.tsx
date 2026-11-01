import { AlPageContent, AlPageLayout } from '@autolokate/ui';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AdminCommandPalette } from '@/components/AdminCommandPalette';
import { AdminHeader } from '@/layouts/AdminHeader';
import { AdminSidebar } from '@/layouts/AdminSidebar';

export function AdminShellLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

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
          <Outlet />
        </AlPageContent>
      </AlPageLayout>
      <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

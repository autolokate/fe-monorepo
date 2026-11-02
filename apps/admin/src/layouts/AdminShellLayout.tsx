import { AlPageContent, AlPageLayout } from '@autolokate/ui';
import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import type { AdminNavGroupId } from '@/app/routes/admin-paths';
import { AdminCommandPalette } from '@/components/AdminCommandPalette';
import { matchAdminRoute } from '@/layouts/admin-breadcrumbs';
import { recordRecentAdminRoute } from '@/layouts/admin-recent-routes';
import { loadAdminShellPrefs, saveAdminShellPrefs } from '@/layouts/admin-shell-prefs';
import { AdminHeader } from '@/layouts/AdminHeader';
import { AdminSidebar } from '@/layouts/AdminSidebar';
import { AdminRouteErrorBoundary } from '@/platform/components/AdminRouteErrorBoundary';

export function AdminShellLayout() {
  const [prefs, setPrefs] = useState(loadAdminShellPrefs);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    saveAdminShellPrefs(prefs);
  }, [prefs]);

  // Close the mobile drawer whenever the route changes (link click, palette, back button), and
  // remember the page for the palette's "Recent" group.
  useEffect(() => {
    setMobileOpen(false);
    const route = matchAdminRoute(pathname);
    if (route) recordRecentAdminRoute(route.path);
  }, [pathname]);

  const toggleCollapse = useCallback(() => {
    setPrefs((current) => ({ ...current, sidebarCollapsed: !current.sidebarCollapsed }));
  }, []);

  const toggleGroup = useCallback((id: AdminNavGroupId) => {
    setPrefs((current) => ({
      ...current,
      closedGroups: current.closedGroups.includes(id)
        ? current.closedGroups.filter((entry) => entry !== id)
        : [...current.closedGroups, id],
    }));
  }, []);

  const openPalette = useCallback(() => {
    setCommandOpen(true);
  }, []);

  return (
    <div className="ax-shell">
      <a className="ax-skip-link" href="#ax-main">
        Skip to content
      </a>
      {mobileOpen ? (
        <button
          type="button"
          className="ax-backdrop"
          aria-label="Close navigation"
          onClick={() => {
            setMobileOpen(false);
          }}
        />
      ) : null}
      <AlPageLayout
        className={prefs.sidebarCollapsed ? 'ax-layout is-rail' : 'ax-layout'}
        sidebarClassName={mobileOpen ? 'is-mobile-open' : undefined}
        sidebar={
          <AdminSidebar
            collapsed={prefs.sidebarCollapsed && !mobileOpen}
            closedGroups={prefs.closedGroups}
            onToggleCollapse={toggleCollapse}
            onToggleGroup={toggleGroup}
            onOpenCommandPalette={openPalette}
            onNavigate={() => {
              setMobileOpen(false);
            }}
          />
        }
        header={
          <AdminHeader
            onOpenCommandPalette={openPalette}
            onOpenMobileNav={() => {
              setMobileOpen(true);
            }}
          />
        }
      >
        <AlPageContent maxWidth="xl">
          <main id="ax-main" tabIndex={-1} className="ax-main">
            <div key={pathname} className="ax-route-enter">
              <AdminRouteErrorBoundary resetKey={pathname}>
                <Outlet />
              </AdminRouteErrorBoundary>
            </div>
          </main>
        </AlPageContent>
      </AlPageLayout>
      <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

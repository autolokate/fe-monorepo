import { ChevronRight, LogOut, Menu, Search } from 'lucide-react';
import { Fragment, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { buildAdminBreadcrumbs } from '@/layouts/admin-breadcrumbs';
import { AdminActivityNotification } from '@/platform/components/AdminActivityNotification';
import { ThemeToggleButton } from '@/platform/theme/ThemeToggleButton';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

export type AdminHeaderProps = {
  onOpenCommandPalette: () => void;
  onOpenMobileNav: () => void;
};

export function AdminHeader({ onOpenCommandPalette, onOpenMobileNav }: AdminHeaderProps) {
  const { signOut } = useAdminAuth();
  const { pathname } = useLocation();
  const crumbs = useMemo(() => buildAdminBreadcrumbs(pathname), [pathname]);

  return (
    <header className="ax-header">
      <div className="ax-header__leading">
        <button
          type="button"
          className="ax-icon-btn ax-header__menu"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu size={18} aria-hidden />
        </button>
        {crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="ax-breadcrumbs">
            <ol>
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <Fragment key={`${crumb.label}-${String(index)}`}>
                    <li className={last ? 'is-current' : undefined}>
                      {crumb.to && !last ? (
                        <Link to={crumb.to}>{crumb.label}</Link>
                      ) : (
                        <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                      )}
                    </li>
                    {last ? null : (
                      <li aria-hidden className="ax-breadcrumbs__sep">
                        <ChevronRight size={14} />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>

      <div className="ax-header__actions">
        <button
          type="button"
          className="ax-command-trigger"
          onClick={onOpenCommandPalette}
          aria-keyshortcuts="Meta+K Control+K"
        >
          <Search size={15} aria-hidden />
          <span className="ax-command-trigger__label">Jump to…</span>
          <kbd className="ax-kbd">⌘K</kbd>
        </button>
        <ThemeToggleButton />
        <AdminActivityNotification />
        <button
          type="button"
          className="ax-signout"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut size={15} aria-hidden />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}

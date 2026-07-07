import { AlBrandMark } from '@autolokate/brand';
import { ActivityIcon, CircleUserIcon, CreditCardIcon, HouseIcon, ReceiptTextIcon, ScanLineIcon } from '@autolokate/icons';
import { AlText } from '@autolokate/ui';
import { NavLink } from 'react-router-dom';

import { adminNavRoutes } from '@/app/routes/admin-paths.js';
import { useAdminAuth } from '@/providers/AdminAuthProvider.js';

const NAV_ICONS: Record<string, typeof HouseIcon> = {
  '/dashboard': HouseIcon,
  '/inventory': ScanLineIcon,
  '/qr-batches': ReceiptTextIcon,
  '/promos': CreditCardIcon,
  '/audit-events': ActivityIcon,
  '/finance': CreditCardIcon,
  '/ownership-transfers': CircleUserIcon,
};

export type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
};

export function AdminSidebar({ collapsed, onToggleCollapse, onNavigate }: AdminSidebarProps) {
  const { session, adminRole } = useAdminAuth();
  const activeRole = session?.role ?? adminRole;

  return (
    <div className={`admin-shell-sidebar ${collapsed ? 'is-collapsed' : ''}`.trim()}>
      <div className="admin-shell-sidebar__brand">
        <div className="admin-shell-sidebar__brand-mark">
          <AlBrandMark size={20} aria-hidden />
        </div>
        <div className="admin-shell-sidebar__brand-text">
          <AlText variant="label">Autolokate</AlText>
          <AlText variant="caption" tone="muted">
            Admin
          </AlText>
        </div>
      </div>

      <nav className="admin-shell-sidebar__scroll" aria-label="Admin navigation">
        <div className="admin-shell-sidebar__group">
          <p className="admin-shell-sidebar__group-label">Modules</p>
          {adminNavRoutes.map((route) => {
            const Icon = NAV_ICONS[route.path] ?? HouseIcon;
            return (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `admin-shell-nav-item al-admin-focus-ring ${isActive ? 'is-active' : ''}`.trim()
                }
                title={route.label}
                onClick={onNavigate}
              >
                <span className="admin-shell-nav-item__icon">
                  <Icon size={18} aria-hidden />
                </span>
                <span className="admin-shell-nav-item__label">{route.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="admin-shell-sidebar__footer">
        {!collapsed ? (
          <div className="admin-shell-sidebar__role" title={`Active role: ${activeRole}`}>
            <AlText variant="caption" tone="muted">
              Role
            </AlText>
            <AlText variant="label">{activeRole}</AlText>
          </div>
        ) : null}
        <button
          type="button"
          className="admin-shell-sidebar__collapse al-admin-focus-ring"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapse}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            {collapsed ? (
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

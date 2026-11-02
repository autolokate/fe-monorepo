import { AlBrandMark } from '@autolokate/brand';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { adminNavSections, adminPaths, type AdminNavGroupId } from '@/app/routes/admin-paths';
import { env } from '@/config/env';
import { adminNavIcon } from '@/layouts/admin-nav-icons';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Routes whose children are separate nav items — they must only light up on an exact match. */
const EXACT_ROUTES = new Set<string>([
  adminPaths.discovery,
  adminPaths.partners,
  adminPaths.dashboard,
]);

const ENV_LABEL: Record<string, string | null> = {
  development: 'Dev',
  staging: 'Staging',
  production: null,
};

export type AdminSidebarProps = {
  collapsed: boolean;
  closedGroups: readonly AdminNavGroupId[];
  onToggleCollapse: () => void;
  onToggleGroup: (id: AdminNavGroupId) => void;
  onOpenCommandPalette: () => void;
  onNavigate?: () => void;
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function AdminSidebar({
  collapsed,
  closedGroups,
  onToggleCollapse,
  onToggleGroup,
  onOpenCommandPalette,
  onNavigate,
}: AdminSidebarProps) {
  const { session, profile } = useAdminAuth();
  const { themeMode } = useTheme();
  const envLabel = ENV_LABEL[env.environment] ?? null;
  const displayName = profile?.name?.trim() || 'Operator';
  const role = session?.role ?? '—';

  return (
    <div className={`ax-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="ax-sidebar__brand">
        <span className="ax-sidebar__logo" aria-hidden>
          <AlBrandMark size={18} variant={themeMode === 'dark' ? 'dark' : 'light'} />
        </span>
        <span className="ax-sidebar__brand-text">
          <span className="ax-sidebar__brand-name">Autolokate</span>
          <span className="ax-sidebar__brand-sub">Admin console</span>
        </span>
        {envLabel ? (
          <span
            className="ax-env-pill"
            data-env={env.environment}
            title={`Connected to the ${envLabel} API`}
          >
            {envLabel}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        className="ax-sidebar__search"
        onClick={onOpenCommandPalette}
        aria-label="Search pages and actions"
        aria-keyshortcuts="Meta+K Control+K"
        title="Search (⌘K)"
      >
        <Search size={16} aria-hidden />
        <span className="ax-sidebar__search-label">Search…</span>
        <kbd className="ax-kbd">⌘K</kbd>
      </button>

      <nav className="ax-sidebar__nav" aria-label="Admin navigation">
        {adminNavSections().map((section) => {
          const open = collapsed || !closedGroups.includes(section.id);
          const listId = `ax-nav-group-${section.id}`;
          return (
            <div className="ax-nav-group" key={section.id}>
              <button
                type="button"
                className="ax-nav-group__header"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => {
                  onToggleGroup(section.id);
                }}
                tabIndex={collapsed ? -1 : 0}
              >
                <span>{section.label}</span>
                <ChevronDown size={14} aria-hidden className="ax-nav-group__chevron" />
              </button>
              <ul className="ax-nav-group__list" id={listId} hidden={!open}>
                {section.items.map((route) => {
                  const Icon = adminNavIcon(route.path);
                  return (
                    <li key={route.path}>
                      <NavLink
                        to={route.path}
                        end={EXACT_ROUTES.has(route.path)}
                        className={({ isActive }) => `ax-nav-item${isActive ? ' is-active' : ''}`}
                        title={collapsed ? route.label : route.description}
                        onClick={onNavigate}
                      >
                        <Icon
                          className="ax-nav-item__icon"
                          size={17}
                          strokeWidth={1.85}
                          aria-hidden
                        />
                        <span className="ax-nav-item__label">{route.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="ax-sidebar__footer">
        <div className="ax-user" title={`${displayName} · ${role}`}>
          <span className="ax-user__avatar" aria-hidden>
            {initialsOf(displayName)}
          </span>
          <span className="ax-user__text">
            <span className="ax-user__name">{displayName}</span>
            <span className="ax-user__role">{role}</span>
          </span>
        </div>
        <button
          type="button"
          className="ax-icon-btn ax-sidebar__collapse"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} aria-hidden />
          ) : (
            <PanelLeftClose size={16} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

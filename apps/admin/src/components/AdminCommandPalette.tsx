import { Command } from 'cmdk';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminPaths, adminRoutes } from '@/app/routes/admin-paths';

const COMMAND_GROUPS = [
  {
    heading: 'Overview',
    paths: [adminPaths.dashboard],
  },
  {
    heading: 'Operations',
    paths: [adminPaths.inventory, adminPaths.qrBatches, adminPaths.catalog, adminPaths.promos],
  },
  {
    heading: 'Compliance',
    paths: [adminPaths.auditEvents],
  },
  {
    heading: 'Finance',
    paths: [adminPaths.finance, adminPaths.ownershipTransfers],
  },
] as const;

export type AdminCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** cmdk command palette with Autolokate admin styling. */
export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  const navigate = useNavigate();
  const routesByPath = new Map(adminRoutes.map((route) => [route.path, route]));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="admin-command-palette"
      role="dialog"
      aria-label="Command palette"
      aria-modal="true"
    >
      <button
        type="button"
        className="admin-command-palette__backdrop"
        aria-label="Close command palette"
        onClick={() => {
          onOpenChange(false);
        }}
      />
      <Command className="admin-command-palette__panel" label="Admin command palette">
        <Command.Input
          placeholder="Jump to a page…"
          className="admin-command-palette__input"
          autoFocus
        />
        <Command.List className="admin-command-palette__list">
          <Command.Empty className="admin-command-palette__empty">No results found.</Command.Empty>
          {COMMAND_GROUPS.map((group) => (
            <Command.Group key={group.heading} heading={group.heading}>
              {group.paths.map((path) => {
                const route = routesByPath.get(path);
                if (!route) {
                  return null;
                }
                return (
                  <Command.Item
                    key={route.path}
                    value={`${route.label} ${route.description ?? ''}`}
                    className="admin-command-palette__item al-admin-focus-ring"
                    onSelect={() => {
                      void navigate(route.path);
                      onOpenChange(false);
                    }}
                  >
                    <span className="admin-command-palette__item-label">{route.label}</span>
                    {route.description ? (
                      <span className="admin-command-palette__item-desc">{route.description}</span>
                    ) : null}
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
        </Command.List>
        <p className="admin-command-palette__hint">
          <kbd>↑</kbd> <kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close
        </p>
      </Command>
    </div>
  );
}

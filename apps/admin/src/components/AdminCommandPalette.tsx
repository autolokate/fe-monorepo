import { Command } from 'cmdk';
import { Clock, LogOut, MoonStar, Sun } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminNavRoutes, adminNavSections } from '@/app/routes/admin-paths';
import { scoreAdminCommand } from '@/layouts/admin-command-score';
import { adminNavIcon } from '@/layouts/admin-nav-icons';
import { readRecentAdminRoutes } from '@/layouts/admin-recent-routes';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

export type AdminCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** ⌘K / Ctrl+K palette — jump to any page, recent pages first, plus a few shell actions. */
export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();
  const { signOut } = useAdminAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const recent = useMemo(() => {
    if (!open) return [];
    const paths = readRecentAdminRoutes();
    return paths
      .map((path) => adminNavRoutes.find((route) => route.path === path))
      .filter((route): route is (typeof adminNavRoutes)[number] => Boolean(route))
      .slice(0, 4);
  }, [open]);

  // Dialog focus management: remember the opener, focus the input, restore focus on close.
  useEffect(() => {
    if (open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      inputRef.current?.focus();
      return;
    }
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === 'Escape' && open) {
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

  const go = (path: string) => {
    void navigate(path);
    onOpenChange(false);
  };

  return (
    <div className="ax-palette" role="dialog" aria-label="Command palette" aria-modal="true">
      <button
        type="button"
        className="ax-palette__backdrop"
        aria-label="Close command palette"
        tabIndex={-1}
        onClick={() => {
          onOpenChange(false);
        }}
      />
      <Command
        className="ax-palette__panel"
        label="Admin command palette"
        loop
        filter={scoreAdminCommand}
      >
        <Command.Input
          ref={inputRef}
          placeholder="Search pages and actions…"
          className="ax-palette__input"
        />
        <Command.List className="ax-palette__list">
          <Command.Empty className="ax-palette__empty">No results found.</Command.Empty>
          {recent.length > 0 ? (
            <Command.Group heading="Recent">
              {recent.map((route) => (
                <Command.Item
                  key={`recent-${route.path}`}
                  value={`recent:${route.label}`}
                  keywords={['recent', route.description ?? '']}
                  className="ax-palette__item"
                  onSelect={() => {
                    go(route.path);
                  }}
                >
                  <Clock size={16} aria-hidden className="ax-palette__icon" />
                  <span className="ax-palette__label">{route.label}</span>
                  <span className="ax-palette__desc">{route.description}</span>
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}
          {adminNavSections().map((section) => (
            <Command.Group key={section.id} heading={section.label}>
              {section.items.map((route) => {
                const Icon = adminNavIcon(route.path);
                return (
                  <Command.Item
                    key={route.path}
                    value={route.label}
                    keywords={[section.label, route.description ?? '']}
                    className="ax-palette__item"
                    onSelect={() => {
                      go(route.path);
                    }}
                  >
                    <Icon size={16} aria-hidden className="ax-palette__icon" />
                    <span className="ax-palette__label">{route.label}</span>
                    {route.description ? (
                      <span className="ax-palette__desc">{route.description}</span>
                    ) : null}
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
          <Command.Group heading="Actions">
            <Command.Item
              value="Toggle theme"
              keywords={['dark', 'light', 'mode', 'appearance']}
              className="ax-palette__item"
              onSelect={() => {
                toggleTheme();
                onOpenChange(false);
              }}
            >
              {themeMode === 'dark' ? (
                <Sun size={16} aria-hidden className="ax-palette__icon" />
              ) : (
                <MoonStar size={16} aria-hidden className="ax-palette__icon" />
              )}
              <span className="ax-palette__label">
                {themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </Command.Item>
            <Command.Item
              value="Sign out"
              keywords={['log out', 'logout']}
              className="ax-palette__item"
              onSelect={() => {
                onOpenChange(false);
                void signOut();
              }}
            >
              <LogOut size={16} aria-hidden className="ax-palette__icon" />
              <span className="ax-palette__label">Sign out</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
        <p className="ax-palette__hint">
          <kbd className="ax-kbd">↑</kbd>
          <kbd className="ax-kbd">↓</kbd> navigate <kbd className="ax-kbd">↵</kbd> open{' '}
          <kbd className="ax-kbd">esc</kbd> close
        </p>
      </Command>
    </div>
  );
}

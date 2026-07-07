import { useEffect, useMemo, useState } from 'react';
import { AlBrandMark } from '@autolokate/brand';
import { setThemeMode, type ThemeMode } from '@autolokate/design-system';
import { AlButton, AlHeading, AlText } from '@autolokate/ui';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { AppContent } from './docs/AppContent.js';
import type { DocPageId } from './docs/types.js';
import { navigationGroups } from './sidebar/navigation.config.js';
import { DocsSidebar } from './sidebar/Sidebar.js';

const pageDescriptions: Record<DocPageId, string> = {
  overview: 'Figma-aligned Autolokate Consumer App design system',
  installation: 'Setup and integration',
  usage: 'Token-first component usage guidance',
  colors: 'Monochrome-first palette and signal semantics',
  'screen-backgrounds': 'AlScreenBg ambient tint variants for full-screen canvases',
  typography: 'Inter hierarchy and readability system',
  spacing: 'Rhythm, whitespace, and layout pacing',
  radius: 'Corner language for controls and surfaces',
  motion: 'Calm transitions and interactive feedback timing',
  'brand-logo': 'Brand assets and clear-space behavior',
  icons: 'Figma Foundations icon set',
  'core-button': 'Primary, secondary, and destructive actions',
  'core-status-pill': 'Protected, attention, and alert status chips',
  'core-text-field': 'Phone and prefix text field',
  'core-input': 'Labeled text input primitive',
  'core-otp-input': 'Segmented OTP entry',
  'core-toggle': 'Binary toggle control',
  'core-checkbox': 'Checkbox with validation',
  'core-plate-input': 'Vehicle registration plate input',
  'core-chip': 'Green, amber, and neutral filter chips',
  'core-plan-card': 'Subscription plan tier selection card',
  'core-vehicle-rc-card': 'Registration certificate display card',
  'core-avatar': 'User avatar with initials fallback',
  'core-field': 'Read-only label/value field row',
  'core-quick-action': 'Icon shortcut tile',
  'core-step-progress': 'Horizontal onboarding step indicator',
  'core-bottom-nav': 'Four-tab mobile navigation',
  'core-status-bar': 'Device status bar for mobile previews',
  'core-text': 'Typography text primitive',
  'core-heading': 'Semantic heading primitive',
  'core-stack': 'Vertical flex stack layout',
  'core-grid': 'CSS grid layout primitive',
  'core-container': 'Max-width content container',
  'core-divider': 'Horizontal divider rule',
  'core-icon-button': 'Accessible icon-only button',
  'admin-data-table': 'Admin DataTable, headers, metrics, and empty states',
  'composition-index': 'Figma composition validation overview',
  'composition-form-section': 'Form field stack — phone, plate, name, OTP',
  'composition-vehicle-info': 'Vehicle detail rows with protection status',
  'composition-contact-card': 'Avatar and owner field pairing',
  'composition-quick-action-row': 'Horizontal quick action tile row',
  'composition-bottom-nav': 'Bottom nav with each tab active',
  'composition-status-card': 'Status pills and chips summary card',
  'composition-empty-content': 'Empty state with icon, copy, and CTA',
  'composition-step-progress': 'Onboarding step progress states 1–5',
  'composition-plan-card': 'Plan tier card with feature checklist',
};

const THEME_STORAGE_KEY = 'al-ui-preview-theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const prefersReducedMotion = useReducedMotion();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activePage, setActivePage] = useState<DocPageId>('overview');
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setThemeMode(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('keydown', onEscape);
    };
  }, []);

  const searchItems = useMemo(
    () =>
      navigationGroups
        .flatMap((group) => group.items)
        .map((item) => ({ label: item.label, page: item.id })),
    [],
  );

  const filteredSearch =
    search.trim().length > 0
      ? searchItems.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  const activeLabel =
    searchItems.find((item) => item.page === activePage)?.label ?? 'Overview';
  const activeDescription =
    filteredSearch.length > 0
      ? 'Search across documentation and component showcase pages'
      : pageDescriptions[activePage];

  return (
    <div className="ds-app">
      {mobileOpen ? (
        <button
          type="button"
          className="ds-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => {
            setMobileOpen(false);
          }}
        />
      ) : null}

      <DocsSidebar
        activePage={activePage}
        search={search}
        mobileOpen={mobileOpen}
        collapsed={sidebarCollapsed}
        onSelect={(page) => {
          setActivePage(page);
          setSearch('');
          setMobileOpen(false);
        }}
        onSearch={setSearch}
        onMobileClose={() => {
          setMobileOpen(false);
        }}
        onToggleCollapse={() => {
          setSidebarCollapsed((current) => !current);
        }}
      />

      <main className="ds-main">
        <header className="ds-header">
          <button
            type="button"
            className="ds-header__menu"
            aria-label="Open navigation"
            onClick={() => {
              setMobileOpen(true);
              setSidebarCollapsed(false);
            }}
          >
            <span className="ds-header__menu-bars" />
          </button>
          <div className="ds-header__title-wrap">
            <div className="ds-header__brandline">
              <AlBrandMark size={20} aria-hidden />
              <AlText variant="caption">AUTOMOTIVE UI SYSTEM</AlText>
            </div>
            <AlHeading variant="h4">{activeLabel}</AlHeading>
            <AlText tone="muted">{activeDescription}</AlText>
          </div>
          <div className="ds-theme-switcher">
            <motion.div
              layout={!prefersReducedMotion}
              className="ds-theme-switcher__inner"
            >
              <AlButton
                variant={theme === 'light' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setTheme('light');
                }}
              >
                Light
              </AlButton>
              <AlButton
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setTheme('dark');
                }}
              >
                Dark
              </AlButton>
            </motion.div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.section
            key={filteredSearch.length > 0 ? `search-${search}` : activePage}
            className="ds-content-stage"
            initial={
              prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: 'easeOut' }
            }
          >
            {filteredSearch.length > 0 ? (
              <section className="ds-card ds-card--showcase">
                <AlHeading variant="h3">Search results</AlHeading>
                <ul className="ds-search-results">
                  {filteredSearch.map((item) => (
                    <li key={`${item.page}-${item.label}`}>
                      <button
                        type="button"
                        className="ds-search-result"
                        onClick={() => {
                          setActivePage(item.page);
                          setSearch('');
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <AppContent page={activePage} />
            )}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}

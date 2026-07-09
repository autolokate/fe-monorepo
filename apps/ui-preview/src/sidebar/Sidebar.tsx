import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlBrandMark } from '@autolokate/brand';
import { AlIcon } from '@autolokate/icons';
import {
  AlIconButton,
  AlInput,
  AlText,
} from '@autolokate/ui';

import { DOCS_VERSION, navigationGroups } from './navigation.config';
import type { DocPageId } from './Sidebar.types';
import './Sidebar.css';

type SidebarProps = {
  activePage: DocPageId;
  search: string;
  mobileOpen: boolean;
  collapsed: boolean;
  onSelect: (page: DocPageId) => void;
  onSearch: (value: string) => void;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
};

function focusNextLink(step: number, container: HTMLElement | null) {
  if (!container) {
    return;
  }
  const links = Array.from(
    container.querySelectorAll<HTMLButtonElement>('[data-doc-link="true"]'),
  );
  if (links.length === 0) {
    return;
  }
  const active = document.activeElement;
  const currentIndex = links.findIndex((link) => link === active);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const nextIndex = (safeIndex + step + links.length) % links.length;
  links[nextIndex]?.focus();
}

export function DocsSidebar({
  activePage,
  search,
  mobileOpen,
  collapsed,
  onSelect,
  onSearch,
  onMobileClose,
  onToggleCollapse,
}: SidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement | null>(null);

  return (
    <aside className={`ds-docs-sidebar${mobileOpen ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}>
      <div className="ds-docs-sidebar__panel">
        <div className="ds-docs-sidebar__brand">
          <AlBrandMark size={28} aria-label="Autolokate" />
          <div className="ds-docs-sidebar__title-wrap">
            <AlText variant="label">Autolokate Design System</AlText>
            <AlText tone="muted" className="ds-docs-sidebar__subtitle">
              Figma Consumer App
            </AlText>
            <span className="ds-docs-sidebar__version">{DOCS_VERSION}</span>
          </div>
          <AlIconButton
            icon={<AlIcon name="arrow-left" size={16} aria-label="Toggle collapse" />}
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ds-docs-sidebar__collapse"
            onClick={onToggleCollapse}
          />
          <AlIconButton
            icon={<AlIcon name="circle-x" size={18} aria-label="Close" />}
            label="Close navigation"
            className="ds-docs-sidebar__close"
            onClick={onMobileClose}
          />
        </div>

        <div className="ds-docs-sidebar__search">
          <AlInput
            label="Search docs"
            placeholder="Search docs..."
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
            }}
          />
        </div>

        <nav
          ref={navRef}
          className="ds-docs-sidebar__groups"
          aria-label="Documentation navigation"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              focusNextLink(1, navRef.current);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              focusNextLink(-1, navRef.current);
            } else if (event.key === 'Home') {
              event.preventDefault();
              const first = navRef.current?.querySelector<HTMLButtonElement>(
                '[data-doc-link="true"]',
              );
              first?.focus();
            } else if (event.key === 'End') {
              event.preventDefault();
              const links = navRef.current?.querySelectorAll<HTMLButtonElement>(
                '[data-doc-link="true"]',
              );
              links?.[links.length - 1]?.focus();
            }
          }}
        >
          {navigationGroups.map((group) => (
            <section key={group.id} className="ds-docs-sidebar__group">
              <AlText variant="label" className="ds-docs-sidebar__group-title">
                {group.label}
              </AlText>
              <ul className="ds-docs-sidebar__list">
                {group.items.map((item) => {
                  const isActive = item.id === activePage;
                  return (
                    <li key={item.id}>
                      <motion.button
                        type="button"
                        data-doc-link="true"
                        title={collapsed ? item.label : undefined}
                        className={`ds-docs-sidebar__link${isActive ? ' is-active' : ''}`}
                        onClick={() => {
                          onSelect(item.id);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="ds-sidebar-active-pill"
                            className="ds-docs-sidebar__active-bg"
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : { duration: 0.2, ease: 'easeOut' }
                            }
                          />
                        ) : null}
                        <span className="ds-docs-sidebar__link-icon" aria-hidden>
                          <AlIcon name={item.icon} size={16} />
                        </span>
                        <span className="ds-docs-sidebar__link-label">{item.label}</span>
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  );
}

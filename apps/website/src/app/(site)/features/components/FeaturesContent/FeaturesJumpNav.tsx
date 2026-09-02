'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FEATURE_CATEGORIES } from './features-catalog';
import styles from './jump-nav.module.css';

const DARK_SECTION_IDS = new Set(['safety']);

/** Matches site header offset (`pt-16` on marketing main). */
const SITE_HEADER_OFFSET_PX = 64;

export function FeaturesJumpNav() {
  const navRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [activeId, setActiveId] = useState(FEATURE_CATEGORIES[0]?.id ?? 'daily');

  useEffect(() => {
    const nav = navRef.current;
    const sentinel = sentinelRef.current;
    const placeholder = placeholderRef.current;
    if (!nav || !sentinel || !placeholder) return;

    const syncPlaceholder = (pinned: boolean) => {
      placeholder.style.height = pinned ? `${String(nav.offsetHeight)}px` : '0px';
    };

    const pinObserver = new IntersectionObserver(
      ([entry]) => {
        const pinned = !entry.isIntersecting;
        setIsPinned(pinned);
        syncPlaceholder(pinned);
      },
      {
        rootMargin: `-${String(SITE_HEADER_OFFSET_PX)}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    pinObserver.observe(sentinel);

    const resizeObserver = new ResizeObserver(() => {
      if (placeholder.style.height !== '0px') {
        syncPlaceholder(true);
      }
    });
    resizeObserver.observe(nav);

    return () => {
      pinObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const sections = FEATURE_CATEGORIES.map((cat) => document.getElementById(cat.id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${String(SITE_HEADER_OFFSET_PX + 56)}px 0px -52% 0px`,
        threshold: [0, 0.2, 0.45, 0.7],
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const isDarkContext = DARK_SECTION_IDS.has(activeId);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <div ref={placeholderRef} className={styles.placeholder} aria-hidden="true" />
      <nav
        ref={navRef}
        className={[
          styles.nav,
          isPinned ? styles.navPinned : '',
          isDarkContext ? styles.navDark : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Feature categories"
      >
        <div className={styles.inner}>
          <ul className={styles.list}>
            {FEATURE_CATEGORIES.map((category) => {
              const isSafety = category.id === 'safety';
              const isActive = activeId === category.id;

              return (
                <li key={category.id}>
                  <Link
                    href={`#${category.id}`}
                    className={[
                      styles.pill,
                      isActive ? styles.pillActive : '',
                      isSafety ? styles.pillSafety : '',
                      isActive && isSafety ? styles.pillSafetyActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {category.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

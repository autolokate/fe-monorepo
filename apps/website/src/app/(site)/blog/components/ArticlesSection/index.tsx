'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlButton } from '@autolokate/ui/button';
import { BLOG_ARTICLES } from '../../data/articles';
import { INITIAL_COUNT, LOAD_MORE_LABEL, READ_LABEL } from './constants';
import styles from './index.module.css';

export function ArticlesSection() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleArticles = BLOG_ARTICLES.slice(0, visibleCount);
  const hasMore = visibleCount < BLOG_ARTICLES.length;

  return (
    <section aria-label="Articles" className={styles.section}>
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {visibleArticles.map((article) => {
            const { Icon } = article;
            return (
              <li key={article.slug}>
                <Link href={`/blog/${article.slug}`} className={styles.card}>
                  <span className={styles.thumb}>
                    <Icon className={styles.thumbIcon} strokeWidth={1.7} aria-hidden="true" />
                  </span>

                  <span className={styles.body}>
                    <span className={styles.top}>
                      <span className={styles.tag}>{article.category}</span>
                      <span className={styles.title}>{article.title}</span>
                      <span className={styles.excerpt}>{article.excerpt}</span>
                    </span>

                    <span className={styles.readLink}>
                      <span className={styles.readLabel}>{READ_LABEL}</span>{' '}
                      <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {hasMore ? (
          <AlButton
            size="lg"
            variant="secondary"
            radius="lg"
            className={styles.loadMore}
            onClick={() => {
              setVisibleCount(BLOG_ARTICLES.length);
            }}
          >
            {LOAD_MORE_LABEL}
          </AlButton>
        ) : null}
      </div>
    </section>
  );
}

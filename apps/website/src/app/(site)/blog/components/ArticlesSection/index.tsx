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
  const [featured, ...rest] = visibleArticles;

  return (
    <section aria-label="Articles" className={styles.section}>
      <div className={styles.inner}>
        <article className={styles.featured}>
          <Link href={`/blog/${featured.slug}`} className={styles.featuredLink}>
            <span className={styles.featuredMeta}>
              <span className={styles.tag}>{featured.category}</span>
              <span className={styles.featuredTitle}>{featured.title}</span>
              <span className={styles.featuredExcerpt}>{featured.excerpt}</span>
              <span className={styles.meta}>
                {featured.readTime} · {featured.updated}
              </span>
              <span className={styles.readLink}>
                {READ_LABEL} <span aria-hidden="true">→</span>
              </span>
            </span>
            <span className={styles.featuredThumb} aria-hidden="true">
              <featured.Icon className={styles.thumbIcon} strokeWidth={1.5} />
            </span>
          </Link>
        </article>

        {rest.length > 0 ? (
          <ul className={styles.list}>
            {rest.map((article) => {
              const { Icon } = article;
              return (
                <li key={article.slug}>
                  <Link href={`/blog/${article.slug}`} className={styles.row}>
                    <span className={styles.rowThumb} aria-hidden="true">
                      <Icon className={styles.rowIcon} strokeWidth={1.6} />
                    </span>
                    <span className={styles.rowBody}>
                      <span className={styles.tag}>{article.category}</span>
                      <span className={styles.rowTitle}>{article.title}</span>
                      <span className={styles.rowExcerpt}>{article.excerpt}</span>
                    </span>
                    <span className={styles.rowMeta}>
                      <span className={styles.meta}>{article.readTime}</span>
                      <span className={styles.rowArrow} aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}

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

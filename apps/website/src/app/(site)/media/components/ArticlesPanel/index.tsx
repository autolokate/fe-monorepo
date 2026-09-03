'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MediaArticle, MediaArticleCategory } from '../../data/articles';
import { MEDIA_ARTICLE_CATEGORIES } from '../../data/articles';
import styles from './index.module.css';

const PAGE_SIZE = 9;

interface ArticlesPanelProps {
  featured: MediaArticle;
  articles: MediaArticle[];
}

export function ArticlesPanel({ featured, articles }: ArticlesPanelProps) {
  const [category, setCategory] = useState<MediaArticleCategory | 'All'>('All');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (category === 'All') return articles;
    return articles.filter((a) => a.category === category);
  }, [articles, category]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className={styles.wrap}>
      <section className={styles.featured} aria-labelledby="media-featured-article">
        <Link href={`/media/articles/${featured.slug}`} className={styles.featuredLink}>
          <div className={styles.featuredMedia}>
            <Image
              src={featured.coverImage}
              alt={featured.coverAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 62vw"
              className={styles.featuredImage}
            />
            <span className={styles.featuredBadge}>Featured</span>
          </div>
          <div className={styles.featuredCopy}>
            <p className={styles.meta}>
              <span className={styles.category}>{featured.category}</span>
              <span aria-hidden="true">·</span>
              <span>{featured.readingTime}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={featured.date}>{featured.dateLabel}</time>
            </p>
            <h2 id="media-featured-article" className={styles.featuredTitle}>
              {featured.title}
            </h2>
            <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
            <span className={styles.readCta}>Read article</span>
          </div>
        </Link>
      </section>

      <div className={styles.toolbar}>
        <h2 className={styles.sectionTitle}>All articles</h2>
        <div className={styles.filters} role="group" aria-label="Filter articles by category">
          <button
            type="button"
            className={category === 'All' ? styles.chipActive : styles.chip}
            onClick={() => {
              setCategory('All');
              setVisible(PAGE_SIZE);
            }}
          >
            All
          </button>
          {MEDIA_ARTICLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={category === cat ? styles.chipActive : styles.chip}
              onClick={() => {
                setCategory(cat);
                setVisible(PAGE_SIZE);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.grid}>
        {shown.map((article) => (
          <li key={article.slug}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No articles in this category yet.</p>
      ) : null}

      {hasMore ? (
        <div className={styles.moreRow}>
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => {
              setVisible((n) => n + PAGE_SIZE);
            }}
          >
            Load more articles
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ArticleCard({ article }: { article: MediaArticle }) {
  return (
    <Link href={`/media/articles/${article.slug}`} className={styles.card}>
      <div className={styles.cardMedia}>
        <Image
          src={article.coverImage}
          alt={article.coverAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.cardImage}
        />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.meta}>
          <span className={styles.category}>{article.category}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readingTime}</span>
        </p>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.cardExcerpt}>{article.excerpt}</p>
        <time className={styles.cardDate} dateTime={article.date}>
          {article.dateLabel}
        </time>
      </div>
    </Link>
  );
}

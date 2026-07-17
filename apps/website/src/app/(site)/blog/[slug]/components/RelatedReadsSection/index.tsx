import Link from 'next/link';
import type { BlogArticle } from '../../../data/articles';
import styles from './index.module.css';

interface RelatedReadsSectionProps {
  articles: BlogArticle[];
}

const READ_LABEL = 'Read the article';

export function RelatedReadsSection({ articles }: RelatedReadsSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-reads-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            KEEP READING
          </span>
          <h2 id="related-reads-heading" className={styles.heading}>
            Related <span className={styles.headingAccent}>reads.</span>
          </h2>
        </div>

        <ul className={styles.grid}>
          {articles.map((article) => {
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
      </div>
    </section>
  );
}

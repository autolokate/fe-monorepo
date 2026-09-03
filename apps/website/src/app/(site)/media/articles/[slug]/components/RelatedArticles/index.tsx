import Image from 'next/image';
import Link from 'next/link';
import type { MediaArticle } from '../../../../data/articles';
import styles from './index.module.css';

interface RelatedArticlesProps {
  articles: MediaArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-articles-heading">
      <div className={styles.inner}>
        <h2 id="related-articles-heading" className={styles.heading}>
          Related articles
        </h2>
        <ul className={styles.grid}>
          {articles.map((article) => (
            <li key={article.slug}>
              <Link href={`/media/articles/${article.slug}`} className={styles.card}>
                <div className={styles.media}>
                  <Image
                    src={article.coverImage}
                    alt={article.coverAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className={styles.image}
                  />
                </div>
                <div className={styles.copy}>
                  <p className={styles.meta}>
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTime}</span>
                  </p>
                  <h3 className={styles.title}>{article.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { BLOG_ARTICLES, BLOG_COPY } from './constants';
import styles from './index.module.css';

export function BlogSection() {
  const { eyebrow, headline, headlineAccent, subheading, readLabel, indexLabel, indexHref } =
    BLOG_COPY;

  return (
    <section aria-labelledby="media-blog-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="media-blog-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <ul className={styles.articles}>
          {BLOG_ARTICLES.map((article) => {
            const { Icon } = article;
            return (
              <li key={article.id}>
                <Link href={article.href} className={styles.row}>
                  <span className={styles.rowThumb} aria-hidden="true">
                    <Icon className={styles.thumbIcon} strokeWidth={1.6} />
                  </span>
                  <span className={styles.rowBody}>
                    <span className={styles.tag}>{article.category}</span>
                    <span className={styles.title}>{article.title}</span>
                    <span className={styles.excerpt}>{article.excerpt}</span>
                  </span>
                  <span className={styles.rowAction}>
                    <span className={styles.readLink}>
                      {readLabel} <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={indexHref} className={styles.indexLink}>
          {indexLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

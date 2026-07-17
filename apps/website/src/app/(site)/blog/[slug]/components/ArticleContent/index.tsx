import Link from 'next/link';
import { AlMark } from '@/layouts/Header/constants';
import type { BlogArticle } from '../../../data/articles';
import styles from './index.module.css';

interface ArticleContentProps {
  article: BlogArticle;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const { category, title, author, authorTagline, readTime, updated, lead, blocks } = article;

  return (
    <article className={styles.article}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.backLinkRow}>
            <Link href="/blog" className={styles.backLink}>
              ← Back to blog
            </Link>
          </div>

          <div className={styles.category}>
            <span className={styles.categoryDash} aria-hidden="true" />
            <span className={styles.categoryLabel}>{category}</span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          <p className={styles.meta}>
            By {author} · {readTime} · {updated}
          </p>
        </header>

        <div className={styles.heroImage} aria-hidden="true" />

        <div className={styles.body}>
          <p className={styles.lead}>{lead}</p>

          {blocks.map((block, index) =>
            block.type === 'quote' ? (
              <blockquote key={index} className={styles.quote}>
                {block.text}
              </blockquote>
            ) : (
              <section key={index} className={styles.section}>
                <h2 className={styles.sectionHeading}>{block.heading}</h2>
                <p className={styles.sectionBody}>{block.body}</p>
              </section>
            ),
          )}
        </div>

        <div className={styles.byline}>
          <span className={styles.bylineDisc}>
            <AlMark className={styles.bylineMark} />
          </span>
          <div className={styles.bylineText}>
            <span className={styles.bylineName}>{author}</span>
            <span className={styles.bylineTagline}>{authorTagline}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { MediaArticle } from '../../../../data/articles';
import styles from './index.module.css';

interface ArticleBodyProps {
  article: MediaArticle;
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((paragraph, index) => (
        <p key={index} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

export function ArticleBody({ article }: ArticleBodyProps) {
  return (
    <article className={styles.article}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <Link href="/media" className={styles.backLink}>
            ← Back to Media
          </Link>
          <p className={styles.meta}>
            <span className={styles.category}>{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{article.dateLabel}</time>
          </p>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.byline}>
            By {article.author}
            <span className={styles.bylineMuted}> — {article.authorTagline}</span>
          </p>
        </header>

        <div className={styles.hero}>
          <Image
            src={article.coverImage}
            alt={article.coverAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 75rem"
            className={styles.heroImage}
          />
        </div>

        <div className={styles.body}>
          <p className={styles.lead}>{article.lead}</p>

          {article.blocks.map((block, index) => {
            if (block.type === 'quote') {
              return (
                <blockquote key={index} className={styles.quote}>
                  {block.text}
                </blockquote>
              );
            }

            if (block.type === 'stat') {
              return (
                <aside key={index} className={styles.stat} aria-label={block.label}>
                  <p className={styles.statLabel}>{block.label}</p>
                  <p className={styles.statValue}>{block.value}</p>
                  {block.detail ? <p className={styles.statDetail}>{block.detail}</p> : null}
                </aside>
              );
            }

            return (
              <section key={index} className={styles.section}>
                <h2 className={styles.sectionHeading}>{block.heading}</h2>
                <Paragraphs text={block.body} />
              </section>
            );
          })}

          <aside className={styles.takeaway}>
            <p className={styles.takeawayLabel}>Key takeaway</p>
            <p className={styles.takeawayText}>{article.takeaway}</p>
          </aside>
        </div>
      </div>
    </article>
  );
}

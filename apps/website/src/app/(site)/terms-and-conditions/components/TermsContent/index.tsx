import Link from 'next/link';
import { TC_SECTIONS, TC_TOC } from './constants';
import type { TermsParagraph, TermsSection } from './types';
import styles from './index.module.css';

function isEmail(value: string): boolean {
  return value.includes('@');
}

function BlockRows({ rows }: { rows: NonNullable<TermsParagraph['rows']> }) {
  return (
    <div className={styles.rowList}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <p className={styles.rowLabel}>{row.label}</p>
          {isEmail(row.value) ? (
            <p className={styles.rowValue}>
              <Link href={`mailto:${row.value}`} className={styles.rowLink}>
                {row.value}
              </Link>
            </p>
          ) : (
            <p className={styles.rowValue}>{row.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function TermsBlock({ block }: { block: TermsParagraph }) {
  return (
    <div className={styles.block}>
      {block.heading ? <h4 className={styles.blockHeading}>{block.heading}</h4> : null}
      {block.body ? <p className={styles.blockBody}>{block.body}</p> : null}
      {block.bullets ? (
        <ul className={styles.bulletList}>
          {block.bullets.map((bullet) => (
            <li key={bullet} className={styles.bulletItem}>
              <span className={styles.bulletMarker} aria-hidden="true">
                •
              </span>
              <p className={styles.bulletText}>{bullet}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {block.rows ? <BlockRows rows={block.rows} /> : null}
    </div>
  );
}

function TermsSectionBlock({ section }: { section: TermsSection }) {
  return (
    <section
      id={section.id}
      className={styles.termsSection}
      aria-labelledby={`terms-section-${section.id}`}
    >
      <div className={styles.sectionHead}>
        <span className={styles.sectionTile} aria-hidden="true">
          {section.number}
        </span>
        <h2 id={`terms-section-${section.id}`} className={styles.sectionTitle}>
          {section.title}
        </h2>
      </div>

      {section.intro ? <p className={styles.sectionIntro}>{section.intro}</p> : null}

      <div className={styles.blocks}>
        {section.blocks.map((block, index) => (
          <TermsBlock key={`${section.id}-${String(index)}`} block={block} />
        ))}
      </div>
    </section>
  );
}

export function TermsContent() {
  return (
    <section className={styles.section} aria-label="Terms and conditions content">
      <div className={styles.inner}>
        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="On this page">
            <p className={styles.tocLabel}>On this page</p>
            <ol className={styles.tocList}>
              {TC_TOC.map((entry) => (
                <li key={entry.id} className={styles.tocItem}>
                  <span className={styles.tocNumber}>{entry.number}</span>
                  <a href={`#${entry.id}`} className={styles.tocLink}>
                    {entry.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.content}>
            {TC_SECTIONS.map((section) => (
              <TermsSectionBlock key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

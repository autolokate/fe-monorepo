import Link from 'next/link';
import { SHIPPING_SECTIONS, SHIPPING_TOC } from './constants';
import type { ShippingParagraph, ShippingSection } from './types';
import styles from './index.module.css';

function isEmail(value: string): boolean {
  return value.includes('@');
}

function BlockRows({ rows }: { rows: NonNullable<ShippingParagraph['rows']> }) {
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

function ShippingBlock({ block }: { block: ShippingParagraph }) {
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

function ShippingSectionBlock({ section }: { section: ShippingSection }) {
  return (
    <section
      id={section.id}
      className={styles.shippingSection}
      aria-labelledby={`shipping-section-${section.id}`}
    >
      <div className={styles.sectionHead}>
        <span className={styles.sectionTile} aria-hidden="true">
          {section.number}
        </span>
        <h2 id={`shipping-section-${section.id}`} className={styles.sectionTitle}>
          {section.title}
        </h2>
      </div>

      {section.intro ? <p className={styles.sectionIntro}>{section.intro}</p> : null}

      <div className={styles.blocks}>
        {section.blocks.map((block, index) => (
          <ShippingBlock key={`${section.id}-${String(index)}`} block={block} />
        ))}
      </div>
    </section>
  );
}

export function ShippingContent() {
  return (
    <section className={styles.section} aria-label="Shipping and delivery content">
      <div className={styles.inner}>
        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="On this page">
            <p className={styles.tocLabel}>On this page</p>
            <ol className={styles.tocList}>
              {SHIPPING_TOC.map((entry) => (
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
            {SHIPPING_SECTIONS.map((section) => (
              <ShippingSectionBlock key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

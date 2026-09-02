import type { ReactNode } from 'react';
import styles from './section-intro.module.css';

export interface SectionIntroProps {
  id?: string;
  eyebrow?: string;
  headline: ReactNode;
  subheading?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionIntro({
  id,
  eyebrow,
  headline,
  subheading,
  align = 'left',
  className = '',
}: SectionIntroProps) {
  return (
    <header className={`${styles.header} ${align === 'center' ? styles.center : ''} ${className}`}>
      {eyebrow ? (
        <p className="mkt-eyebrow">
          <span className="mkt-eyebrowLine" aria-hidden="true" />
          {eyebrow}
        </p>
      ) : null}

      <h2 id={id} className={`mkt-headline ${styles.headline}`}>
        {headline}
      </h2>

      {subheading ? <p className={`mkt-body ${styles.subheading}`}>{subheading}</p> : null}
    </header>
  );
}

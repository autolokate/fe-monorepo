import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TEAM_CTA, TEAM_PHILOSOPHY } from '../constants';
import styles from './index.module.css';

export function TeamPhilosophy() {
  return (
    <section className={styles.section} aria-labelledby="team-philosophy-heading">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{TEAM_PHILOSOPHY.eyebrow}</p>
        <h2 id="team-philosophy-heading" className={styles.headline}>
          {TEAM_PHILOSOPHY.headline}
        </h2>
        <p className={styles.body}>{TEAM_PHILOSOPHY.body}</p>
        <ul className={styles.pillars}>
          {TEAM_PHILOSOPHY.pillars.map((pillar) => (
            <li key={pillar.title} className={styles.pillar}>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarBody}>{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TeamClosingCta() {
  return (
    <section className={styles.cta} aria-labelledby="team-cta-heading">
      <div className={styles.ctaInner}>
        <h2 id="team-cta-heading" className={styles.ctaHeadline}>
          {TEAM_CTA.headline}
        </h2>
        <p className={styles.ctaBody}>{TEAM_CTA.body}</p>
        <div className={styles.ctaRow}>
          <Link href={TEAM_CTA.primary.href} className={styles.primaryBtn}>
            {TEAM_CTA.primary.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href={TEAM_CTA.secondary.href} className={styles.secondaryBtn}>
            {TEAM_CTA.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PARTNERS } from './constants';
import styles from './partners.module.css';

export function PartnerApps() {
  return (
    <section className={styles.section} aria-labelledby="partners-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            Partner apps
          </p>
          <h2 id="partners-heading" className={styles.headline}>
            Built for the businesses that keep drivers moving.
          </h2>
        </header>

        <div className={styles.grid}>
          {PARTNERS.map((app) => (
            <article key={app.id} className={styles.card}>
              <div className={styles.cardHead}>
                <Image src={app.icon} alt="" width={40} height={40} className={styles.icon} />
                <div>
                  <h3 className={styles.name}>{app.name}</h3>
                  <p className={styles.audience}>{app.audience}</p>
                </div>
              </div>
              <ul className={styles.highlights}>
                {app.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href={app.cta.href}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {app.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

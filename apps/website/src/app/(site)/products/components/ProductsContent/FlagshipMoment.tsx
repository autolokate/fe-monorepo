import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ControlCenterVisual } from '@/components/marketing/StoryCinematicVisual';
import { FLAGSHIP } from './constants';
import styles from './flagship.module.css';

export function FlagshipMoment() {
  const { name, audience, capabilities, cta, icon } = FLAGSHIP;

  return (
    <section className={styles.section} aria-labelledby="flagship-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            Flagship app
          </p>
          <div className={styles.titleRow}>
            <Image src={icon} alt="" width={48} height={48} className={styles.icon} />
            <div>
              <h2 id="flagship-heading" className={styles.name}>
                {name}
              </h2>
              <p className={styles.audience}>{audience}</p>
            </div>
          </div>
          <ul className={styles.capabilities}>
            {capabilities.map((item) => (
              <li key={item} className={styles.capability}>
                {item}
              </li>
            ))}
          </ul>
          <Link href={cta.href} className={styles.cta} target="_blank" rel="noopener noreferrer">
            {cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className={styles.visual}>
          <ControlCenterVisual variant="coordinator" surface="dark" />
        </div>
      </div>
    </section>
  );
}

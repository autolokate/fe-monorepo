import { Car, Check } from 'lucide-react';
import { PhoneCarousel } from '../PhoneCarousel';
import {
  MULTI_VEHICLE_ASIDE,
  MULTI_VEHICLE_CHECKLIST,
  MULTI_VEHICLE_COPY,
  MULTI_VEHICLE_PHONE_SHOTS,
} from './constants';
import styles from './index.module.css';

export function MultiVehicleSection() {
  return (
    <section className={styles.section} aria-labelledby="multi-vehicle-heading">
      <div className={styles.container}>
        <div className={styles.copy}>
          <span className={styles.index} aria-hidden>
            {MULTI_VEHICLE_COPY.index}
          </span>
          <h2 id="multi-vehicle-heading" className={styles.heading}>
            {MULTI_VEHICLE_COPY.heading}
          </h2>
          <p className={styles.description}>{MULTI_VEHICLE_COPY.description}</p>

          <ul className={styles.checklist}>
            {MULTI_VEHICLE_CHECKLIST.map(({ id, label }) => (
              <li key={id} className={styles.checkItem}>
                <span className={styles.checkIcon} aria-hidden>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.media}>
          <PhoneCarousel shots={MULTI_VEHICLE_PHONE_SHOTS} />
        </div>

        <aside className={styles.aside}>
          <span className={styles.asideIcon} aria-hidden>
            <Car className="h-6 w-6 stroke-[1.9]" />
          </span>
          <h3 className={styles.asideHeading}>{MULTI_VEHICLE_ASIDE.heading}</h3>
          <p className={styles.asideText}>{MULTI_VEHICLE_ASIDE.description}</p>
        </aside>
      </div>
    </section>
  );
}

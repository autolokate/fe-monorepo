import { Clock, Shield, Smartphone, Zap } from 'lucide-react';
import { HERO_STATS } from './constants';
import styles from './HeroStatsBar.module.css';

const ICONS = {
  shield: Shield,
  clock: Clock,
  bolt: Zap,
  phone: Smartphone,
} as const;

export function HeroStatsBar() {
  return (
    <div className={styles.bar} aria-label="Autolokate at a glance">
      <dl className={styles.list}>
        {HERO_STATS.map((stat) => {
          const Icon = ICONS[stat.icon];
          return (
            <div key={stat.id} className={styles.item}>
              <Icon className={styles.icon} strokeWidth={1.75} aria-hidden />
              <div>
                <dt className={styles.value}>{stat.value}</dt>
                <dd className={styles.label}>{stat.label}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

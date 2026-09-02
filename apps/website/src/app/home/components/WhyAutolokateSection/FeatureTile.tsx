import type { WhyHighlight } from './types';
import styles from './index.module.css';

interface FeatureTileProps {
  highlight: WhyHighlight;
  index: number;
}

const TONE_CLASS: Record<NonNullable<WhyHighlight['iconTone']>, string> = {
  default: styles.toneDefault,
  brand: styles.toneBrand,
  amber: styles.toneAmber,
};

export function FeatureTile({ highlight, index }: FeatureTileProps) {
  const { title, body, Icon, iconTone = 'default' } = highlight;

  return (
    <article className={styles.tile}>
      <div className={styles.tileTop}>
        <span className={styles.index} aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <span className={`${styles.iconWrap} ${TONE_CLASS[iconTone]}`} aria-hidden="true">
          <Icon className={styles.icon} strokeWidth={1.75} />
        </span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      <span className={styles.hoverLine} aria-hidden="true" />
    </article>
  );
}

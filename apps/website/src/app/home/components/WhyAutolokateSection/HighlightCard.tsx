import type { WhyHighlight } from './types';
import styles from './index.module.css';

interface HighlightCardProps {
  highlight: WhyHighlight;
}

const TONE_CLASS: Record<NonNullable<WhyHighlight['iconTone']>, string> = {
  default: '',
  brand: styles.iconBadgeBrand,
  amber: styles.iconBadgeAmber,
};

export function HighlightCard({ highlight }: HighlightCardProps) {
  const { title, body, Icon, layout, iconTone = 'default' } = highlight;
  const isWide = layout === 'wide';

  return (
    <article className={`${styles.card} ${isWide ? styles.cardWide : styles.cardStacked}`}>
      <span
        className={`${styles.iconBadge} ${isWide ? styles.iconBadgeWide : styles.iconBadgeStacked} ${TONE_CLASS[iconTone]}`}
        aria-hidden="true"
      >
        <Icon className="h-9 w-9" strokeWidth={2} />
      </span>
      <div
        className={`${styles.cardText} ${isWide ? styles.cardTextWide : styles.cardTextStacked}`}
      >
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardBody}>{body}</p>
      </div>
    </article>
  );
}

import type { TrustTestimonial } from './constants';
import styles from './trust-carousel.module.css';

interface TrustTestimonialCardProps {
  testimonial: TrustTestimonial;
  featured: boolean;
}

function QuoteGlyph() {
  return (
    <svg className={styles.quoteGlyph} viewBox="0 0 14 11" fill="none" aria-hidden="true">
      <path
        d="M0 10.6912V7.51472C0 6.61276 0.176471 5.69119 0.529412 4.75001C0.882354 3.80883 1.34804 2.92157 1.92647 2.08824C2.50491 1.2549 3.13236 0.558823 3.80883 0L6.57354 1.63236C6.02452 2.4951 5.57354 3.39706 5.2206 4.33824C4.87746 5.27942 4.70589 6.32844 4.70589 7.48531V10.6912H0ZM7.42648 10.6912V7.51472C7.42648 6.61276 7.60295 5.69119 7.9559 4.75001C8.30884 3.80883 8.77453 2.92157 9.35296 2.08824C9.93139 1.2549 10.5588 0.558823 11.2353 0L14 1.63236C13.451 2.4951 13 3.39706 12.6471 4.33824C12.3039 5.27942 12.1324 6.32844 12.1324 7.48531V10.6912H7.42648Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TrustTestimonialCard({ testimonial, featured }: TrustTestimonialCardProps) {
  return (
    <article className={`${styles.card} ${featured ? styles.cardFeatured : styles.cardPeek}`}>
      <QuoteGlyph />

      <blockquote className={styles.quoteBlock}>
        <p className={`${styles.quote} ${featured ? styles.quoteFeatured : styles.quotePeek}`}>
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      <footer className={styles.attribution}>
        <span className={styles.avatar} aria-hidden="true">
          {testimonial.initials}
        </span>
        <div className={styles.byline}>
          <p className={styles.name}>{testimonial.name}</p>
          <p className={styles.role}>{testimonial.role}</p>
        </div>
      </footer>
    </article>
  );
}

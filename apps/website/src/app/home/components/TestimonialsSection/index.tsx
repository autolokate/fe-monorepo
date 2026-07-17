import { TestimonialCarousel } from './TestimonialCarousel';
import { TESTIMONIALS_COPY } from './constants';
import styles from './index.module.css';

export function TestimonialsSection() {
  const { eyebrow, headline, headlineAccent } = TESTIMONIALS_COPY;

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="testimonials-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
        </header>

        <TestimonialCarousel />
      </div>
    </section>
  );
}

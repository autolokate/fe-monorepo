import { ResponseNetworkAnimation } from './ResponseNetworkAnimation';
import { RESPONSE_NETWORK_COPY } from './constants';
import styles from './response-network.module.css';

export function ResponseNetworkSection() {
  const { eyebrow, headline, headlineAccent, body } = RESPONSE_NETWORK_COPY;

  return (
    <section className={styles.section} aria-labelledby="response-network-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="response-network-heading" className={styles.headline}>
            {headline} <span className={styles.accent}>{headlineAccent}</span>
          </h2>
          <p className={styles.body}>{body}</p>
        </header>

        <div className={styles.visual}>
          <ResponseNetworkAnimation />
        </div>
      </div>
    </section>
  );
}

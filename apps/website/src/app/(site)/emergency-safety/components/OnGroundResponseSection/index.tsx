/* eslint-disable @next/next/no-img-element -- decorative fork-bracket SVG, no optimization benefit */
import { FORK_BRACKET, RESPONSE_BRANCHES, RESPONSE_COPY, RESPONSE_SOURCE } from './constants';
import styles from './index.module.css';

export function OnGroundResponseSection() {
  const { eyebrow, headline, headlineAccent, subheading, footnote } = RESPONSE_COPY;
  const { Icon: SourceIcon } = RESPONSE_SOURCE;

  return (
    <section aria-labelledby="response-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="response-heading" className={styles.headline}>
            {headline}
            <br />
            <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <div className={styles.chain}>
          <div className={styles.source}>
            <span className={styles.node} aria-hidden="true">
              <SourceIcon className="h-[22px] w-[22px]" strokeWidth={1.9} />
            </span>
            <div className={styles.copy}>
              <h3 className={styles.itemTitle}>{RESPONSE_SOURCE.title}</h3>
              <p className={styles.itemBody}>{RESPONSE_SOURCE.body}</p>
            </div>
          </div>

          <img src={FORK_BRACKET} alt="" aria-hidden="true" className={styles.fork} />

          <ul className={styles.branches}>
            {RESPONSE_BRANCHES.map((branch) => {
              const { Icon } = branch;
              return (
                <li key={branch.id} className={styles.branch}>
                  <span className={styles.node} aria-hidden="true">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                  </span>
                  <div className={styles.copy}>
                    <h3 className={styles.itemTitle}>{branch.title}</h3>
                    <p className={styles.itemBody}>{branch.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className={styles.footnote}>{footnote}</p>
      </div>
    </section>
  );
}

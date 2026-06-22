import type { RealWorldSituation } from "./constants";
import styles from "./index.module.css";

export function SituationCard({ situation }: { situation: RealWorldSituation }) {
  const { title, body, Icon } = situation;

  return (
    <article className={styles.card}>
      <span className={styles.iconWrap} aria-hidden>
        <Icon className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
      </span>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardBody}>{body}</p>
    </article>
  );
}

import { ContactForm } from "../ContactForm";
import { Sidebar } from "../Sidebar";
import styles from "./index.module.css";

export function FormSection() {
  return (
    <section className={styles.section} aria-label="Contact form and information">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
      </div>

      <div className={styles.inner}>
        <div className={styles.grid}>
          <ContactForm />
          <Sidebar />
        </div>
      </div>
    </section>
  );
}

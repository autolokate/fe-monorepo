import Link from 'next/link';
import { ArrowLeft, ArrowRight, Compass, Headphones, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NOT_FOUND_COPY, NOT_FOUND_QUICK_LINKS } from './constants';
import styles from './index.module.css';

export function NotFoundContent() {
  return (
    <div className={styles.page} aria-labelledby="not-found-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgGradient} />
      </div>

      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.code} aria-hidden="true">
            {NOT_FOUND_COPY.code}
          </p>

          <h1 id="not-found-heading" className={styles.headline}>
            {NOT_FOUND_COPY.headline}
          </h1>

          <p className={styles.description}>{NOT_FOUND_COPY.description}</p>

          <div className={styles.statusBox}>
            <span className={styles.statusIcon} aria-hidden="true">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p className={styles.statusCopy}>
              <span className={styles.statusTitle}>{NOT_FOUND_COPY.statusTitle}</span>{' '}
              {NOT_FOUND_COPY.statusBody}
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              size="lg"
              asChild
              className="border-transparent bg-white px-6 text-[#0a0a0a] shadow-none hover:bg-zinc-100"
            >
              <Link href={NOT_FOUND_COPY.primaryCta.href}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {NOT_FOUND_COPY.primaryCta.label}
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/55 bg-transparent px-6 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              <Link href={NOT_FOUND_COPY.secondaryCta.href}>
                <Compass className="h-4 w-4" aria-hidden />
                {NOT_FOUND_COPY.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </section>

        <section className={styles.quickLinksSection} aria-labelledby="not-found-quick-links">
          <div className={styles.quickLinksPanel}>
            <h2 id="not-found-quick-links" className={styles.quickLinksTitle}>
              {NOT_FOUND_COPY.quickLinksTitle}
            </h2>

            <ul className={styles.quickLinksList}>
              {NOT_FOUND_QUICK_LINKS.map(({ id, label, href, Icon }) => (
                <li key={id}>
                  <Link href={href} className={styles.quickLink}>
                    <span className={styles.quickLinkIcon} aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={styles.quickLinkLabel}>{label}</span>
                    <ArrowRight className={styles.quickLinkArrow} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className={styles.support}>
          <p className={styles.supportText}>
            <Headphones className="h-4 w-4 shrink-0" aria-hidden />
            {NOT_FOUND_COPY.supportText}
          </p>
          <Link href={NOT_FOUND_COPY.contactCta.href} className={styles.contactLink}>
            {NOT_FOUND_COPY.contactCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </footer>
      </div>
    </div>
  );
}

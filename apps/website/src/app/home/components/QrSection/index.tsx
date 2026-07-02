import Image from "next/image";
import {
  QR_FEATURES,
  QR_SECTION_BACKGROUND,
  QR_SECTION_COPY,
  QR_SECTION_IMAGE,
} from "./constants";
import { QrCta } from "./QrCta";
import styles from "./index.module.css";

export function QrSection() {
  return (
    <section
      aria-labelledby="home-qr-section-heading"
      className="relative isolate z-[1] overflow-hidden bg-background pb-16 pt-8 text-foreground sm:pb-20 sm:pt-10 lg:pb-24 lg:pt-12"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src={QR_SECTION_BACKGROUND}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[72%_center] lg:object-[78%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-25% via-background/92 via-50% to-background/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-4 lg:pr-4">
            <span
              className={`${styles.accent} font-mono text-[11px] font-semibold uppercase tracking-[0.28em] sm:text-xs`}
            >
              {QR_SECTION_COPY.eyebrow}
            </span>

            <h2
              id="home-qr-section-heading"
              className="font-display mt-4 text-balance text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.5rem]"
            >
              {QR_SECTION_COPY.headlineLine1}
              <br />
              {QR_SECTION_COPY.headlineLine2Prefix}
              <span className={styles.accent}>{QR_SECTION_COPY.headlineEmphasis}</span>
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {QR_SECTION_COPY.subheading}
            </p>

            <QrCta />
          </div>

          {/* QR product image */}
          <div className="flex justify-center lg:col-span-4">
            <div
              className={`${styles.qrFrame} relative w-full max-w-[19.25rem] sm:max-w-[22rem] lg:max-w-[26.5rem]`}
            >
              <Image
                src={QR_SECTION_IMAGE}
                alt="Autolokate emergency QR plate with scan code and vehicle ID"
                width={440}
                height={572}
                className="h-auto w-full drop-shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22)]"
                sizes="(max-width: 1024px) 308px, 352px"
                priority={false}
              />
              <span className={styles.scanArea} aria-hidden>
                <span className={styles.scanLine} />
              </span>
            </div>
          </div>

          {/* Feature cards */}
          <div className="relative min-w-0 lg:col-span-4">
            <ul className="flex flex-col gap-3">
              {QR_FEATURES.map(({ title, body, Icon }) => (
                <li key={title}>
                  <article
                    className={`${styles.featureCard} flex items-center gap-4 rounded-2xl px-4 py-4 sm:px-5 sm:py-[1.125rem]`}
                  >
                    <span
                      className={`${styles.iconBadge} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl`}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5 stroke-[1.75]" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold leading-snug text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

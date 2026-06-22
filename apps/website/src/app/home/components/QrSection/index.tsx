import Image from "next/image";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  QR_FEATURES,
  QR_SECTION_BACKGROUND,
  QR_SECTION_COPY,
  QR_SECTION_IMAGE,
} from "./constants";

export function QrSection() {
  return (
    <section
      aria-labelledby="home-qr-section-heading"
      className="relative isolate z-[1] overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src={QR_SECTION_BACKGROUND}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[72%_center] opacity-100 lg:object-[78%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-25% via-background/92 via-50% to-background/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-4 lg:pr-4">
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {QR_SECTION_COPY.eyebrow}
            </span>

            <h2
              id="home-qr-section-heading"
              className="font-display mt-5 text-balance text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
            >
              {QR_SECTION_COPY.headlineLine1}
              <br />
              {QR_SECTION_COPY.headlineLine2}
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
              {QR_SECTION_COPY.subheading}
            </p>

            <Button asChild size="lg" className="mt-8 gap-2 px-7">
              <Link href={QR_SECTION_COPY.primaryCta.href}>
                <QrCode className="h-4 w-4" aria-hidden />
                {QR_SECTION_COPY.primaryCta.label}
              </Link>
            </Button>
          </div>

          {/* QR product image */}
          <div className="flex justify-center lg:col-span-4">
            <div className="relative w-full max-w-[19.25rem] sm:max-w-[22rem] lg:max-w-[26.5rem]">
              <Image
                src={QR_SECTION_IMAGE}
                alt="Autolokate emergency QR plate with scan code and vehicle ID"
                width={440}
                height={572}
                className="h-auto w-full drop-shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22)]"
                sizes="(max-width: 1024px) 308px, 352px"
                priority={false}
              />
            </div>
          </div>

          {/* Feature cards */}
          <div className="relative min-w-0 lg:col-span-4">
            <ul className="flex flex-col gap-3">
              {QR_FEATURES.map(({ title, body, Icon }) => (
                <li key={title}>
                  <article
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border border-black/10 bg-white px-4 py-4 sm:px-5 sm:py-[1.125rem]",
                      "shadow-[0_2px_10px_rgba(15,23,42,0.06)]",
                    )}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/70"
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

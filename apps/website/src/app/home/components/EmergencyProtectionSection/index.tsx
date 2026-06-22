import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EMERGENCY_FEATURE_PILLS,
  EMERGENCY_PROTECTION_BACKGROUND,
  EMERGENCY_PROTECTION_COPY,
} from "./constants";

function PillIndicator({ indicator = "dot" }: { indicator?: "dot" | "alert" }) {
  if (indicator === "alert") {
    return (
      <AlertTriangle className="h-3 w-3 shrink-0 text-white/70" strokeWidth={2} aria-hidden />
    );
  }

  return <span className="h-2 w-2 shrink-0 rounded-full bg-white/40" aria-hidden />;
}

export function EmergencyProtectionSection() {
  return (
    <section
      aria-labelledby="emergency-protection-heading"
      className="relative isolate z-[1] pb-10 pt-2 sm:pb-12 lg:pb-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] sm:rounded-3xl">
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
            <Image
              src={EMERGENCY_PROTECTION_BACKGROUND}
              alt=""
              fill
              priority={false}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-left brightness-[0.92] contrast-[1.02] saturate-0"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.88) 48%, rgba(0,0,0,0.96) 100%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-5 p-6 sm:gap-6 sm:p-8 lg:p-10">
              <span
                className="relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 sm:h-[4.75rem] sm:w-[4.75rem]"
                aria-hidden
              >
                <AlertTriangle
                  className="relative h-9 w-9 text-white/90 sm:h-10 sm:w-10"
                  strokeWidth={1.35}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                  {EMERGENCY_PROTECTION_COPY.eyebrow}
                </p>
                <h2
                  id="emergency-protection-heading"
                  className="font-display mt-2.5 max-w-2xl text-balance text-[1.6rem] font-bold leading-[1.12] tracking-tight sm:text-[1.85rem] lg:text-[2rem]"
                >
                  {EMERGENCY_PROTECTION_COPY.headline}
                </h2>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {EMERGENCY_FEATURE_PILLS.map(({ label, indicator }) => (
                    <li key={label}>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 sm:text-[13px]">
                        <PillIndicator indicator={indicator} />
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-[0.9375rem]">
                  {EMERGENCY_PROTECTION_COPY.subheading}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 flex-col items-center justify-center px-6 py-8 text-center",
                "border-t border-white/10 sm:px-10 lg:w-[15.5rem] lg:border-l lg:border-t-0 lg:px-8 lg:py-10 xl:w-[17rem]",
              )}
            >
              <Button
                asChild
                size="lg"
                className="h-11 min-w-[11.5rem] rounded-full border-0 bg-white px-8 text-sm font-bold text-black shadow-none hover:bg-zinc-100"
              >
                <Link href={EMERGENCY_PROTECTION_COPY.ctaHref}>
                  {EMERGENCY_PROTECTION_COPY.ctaTitle}
                </Link>
              </Button>
              <p className="mt-3 text-sm text-white/45">{EMERGENCY_PROTECTION_COPY.ctaPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { VALUE_PILLARS } from "./constants";

export function WhyBook() {
  return (
    <section
      className="border-b border-border px-4 py-8 sm:px-6 sm:py-10"
      aria-labelledby="why-book"
    >
      <div className="mx-auto max-w-6xl">
        <p
          id="why-book"
          className="text-center text-xs font-bold uppercase tracking-[0.18em] text-primary"
        >
          Why book a session?
        </p>
        <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {VALUE_PILLARS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <p className="mt-3 font-display text-base font-semibold text-foreground sm:text-[1.0625rem]">
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { FAQ_ITEMS } from "./constants";

export function Faq() {
  return (
    <section className="space-y-3 sm:space-y-4" aria-labelledby="heading-faq">
      <header className="space-y-1.5 sm:space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.2em]">
          FAQ
        </p>
        <h2
          id="heading-faq"
          className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          Quick answers
        </h2>
      </header>
      <div className="space-y-2 sm:space-y-2.5">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-border bg-muted/40 px-4 py-3 text-left [&_summary::-webkit-details-marker]:hidden sm:px-4 sm:py-3.5"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground sm:text-[0.9375rem]">
              <span className="flex items-center justify-between gap-2">
                {item.q}
                <span className="text-muted-foreground transition group-open:rotate-180">
                  ▼
                </span>
              </span>
            </summary>
            <p className="mt-2 border-t border-border/50 pt-2 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

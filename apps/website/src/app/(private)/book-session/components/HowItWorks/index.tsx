"use client";

import { cn } from "@/lib/utils";
import { FLOW_STEPS } from "./constants";

export function HowItWorks() {
  return (
    <section className="space-y-4 sm:space-y-5" aria-labelledby="heading-flow">
      <header className="space-y-1.5 sm:space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.2em]">
          End-to-end
        </p>
        <h2
          id="heading-flow"
          className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          How every booking runs
        </h2>
      </header>
      <ol className="relative space-y-0 border-l border-primary/25 pl-6">
        {FLOW_STEPS.map((item, i) => (
          <li
            key={item.step}
            className={cn("relative pb-6 last:pb-0 sm:pb-7", i === 0 && "-mt-0.5")}
          >
            <span
              className="absolute -left-6 top-0 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-primary/30 bg-background text-xs font-bold text-primary"
              aria-hidden
            >
              {item.step}
            </span>
            <p className="font-medium text-foreground sm:text-[1.0625rem]">
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

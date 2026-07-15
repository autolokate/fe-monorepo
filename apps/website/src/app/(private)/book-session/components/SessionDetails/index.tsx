'use client';

import { Check, ReceiptText } from 'lucide-react';
import { OUTCOME_LINES } from './constants';

function SectionHeader({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <header className="space-y-1.5 sm:space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground sm:tracking-[0.2em]">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {title}
      </h2>
    </header>
  );
}

export function SessionDetails() {
  return (
    <div className="space-y-8 sm:space-y-9">
      {/* What you get */}
      <section className="space-y-3 sm:space-y-4" aria-labelledby="heading-included">
        <SectionHeader id="heading-included" eyebrow="Session" title="What you get" />
        <ul className="space-y-2.5 sm:space-y-3">
          {OUTCOME_LINES.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <div className="h-px bg-border" role="presentation" />

      {/* Confirmed + Join */}
      <section className="grid gap-4 sm:grid-cols-2" aria-labelledby="heading-confirmed">
        <div className="space-y-2">
          <h3
            id="heading-confirmed"
            className="font-display text-base font-semibold text-foreground"
          >
            Get confirmed
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We verify payment; you&apos;ll see status here and in email.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
            <ReceiptText className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            Meet link appears when your session is ready.
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-base font-semibold text-foreground">Join the call</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Meet link appears when your session is ready — same page, anytime.
          </p>
        </div>
      </section>
    </div>
  );
}

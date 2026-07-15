'use client';

import { Car, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SESSION_FEE } from '../../constants';
import { HERO_CHECKLIST, HERO_CHIPS } from './constants';

export function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-[radial-gradient(ellipse_160%_110%_at_60%_-10%,rgba(244,244,245,0.85),rgba(250,250,250,0.5)_55%,transparent_75%)] px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10"
      aria-labelledby="book-session-heading"
    >
      {/* Faint car silhouette watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <Car className="h-[260px] w-[260px] text-foreground/[0.06] sm:h-[340px] sm:w-[340px] lg:h-[400px] lg:w-[400px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          {/* Left: copy */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:tracking-[0.2em]">
              Expert call <span className="opacity-50">·</span>
            </p>
            <h1
              id="book-session-heading"
              className="font-display mt-2.5 max-w-3xl text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:mt-3 sm:text-4xl sm:leading-[1.05] lg:text-[2.75rem]"
            >
              A clear car decision
              <span className="mt-1 block text-primary sm:mt-0">in 15 minutes.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              One session with an Autolokate advisor — same practical lens as Indian Drive Guide /
              Deepak Chaudhary. Flat fee, no dealer kickbacks.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              {HERO_CHIPS.map(({ Icon, label, accent }) => (
                <span
                  key={label}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:px-3.5',
                    accent
                      ? 'border-primary/25 bg-primary/10 font-semibold text-primary'
                      : 'border-border/70 bg-white/60 text-muted-foreground backdrop-blur-sm',
                  )}
                >
                  <Icon
                    className={cn('h-3.5 w-3.5', accent ? '' : 'text-muted-foreground')}
                    aria-hidden
                  />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-6 sm:mt-7">
              <Button variant="default" className="h-11 px-6 text-sm font-semibold" asChild>
                <a href="#book-session">
                  <Clock className="mr-2 h-4 w-4" aria-hidden />
                  Book a session — pick a slot
                </a>
              </Button>
            </div>
          </div>

          {/* Right: stat card */}
          <div className="rounded-2xl border border-zinc-200 bg-white/95 px-5 py-5 shadow-lg shadow-zinc-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Clock className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-foreground">15 min</p>
                <p className="text-xs text-muted-foreground">Structured 1:1 call</p>
              </div>
            </div>

            <div className="my-4 border-t border-border/60" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">From</p>
              <p className="font-display mt-0.5 text-[2rem] font-bold leading-none tabular-nums text-foreground">
                ₹{SESSION_FEE}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">GST included</p>
            </div>

            <ul className="mt-4 space-y-2">
              {HERO_CHECKLIST.map((c) => (
                <li key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

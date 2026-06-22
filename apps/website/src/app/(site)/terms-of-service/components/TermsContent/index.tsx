import Link from "next/link";
import { Mail, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_SECTIONS,
  TERMS_TOC,
  type TermsParagraph,
  type TermsSection,
} from "./constants";

/* ────────────────────────────────────────────────────────────────────────────
 * Table of contents (sticky on lg+).
 * ──────────────────────────────────────────────────────────────────────── */
function TableOfContents() {
  return (
    <aside
      aria-label="Terms of service contents"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-app-soft backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/12 text-primary">
            <ScrollText className="h-3.5 w-3.5" aria-hidden />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            On this page
          </p>
        </div>

        <ol className="mt-4 space-y-1">
          {TERMS_TOC.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`#${entry.id}`}
                className={cn(
                  "group flex items-start gap-3 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition",
                  "hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <span className="mt-0.5 inline-flex h-5 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-[10.5px] font-bold tabular-nums text-muted-foreground group-hover:border-foreground/30 group-hover:text-foreground">
                  {entry.number}
                </span>
                <span className="leading-snug">{entry.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Single paragraph block (heading + body / bullets / rows).
 * ──────────────────────────────────────────────────────────────────────── */
function TermsBlock({ block }: { block: TermsParagraph }) {
  return (
    <div className="space-y-3">
      {block.heading ? (
        <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
          {block.heading}
        </h3>
      ) : null}

      {block.body ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {block.body}
        </p>
      ) : null}

      {block.bullets && block.bullets.length > 0 ? (
        <ul className="space-y-2.5 pl-1">
          {block.bullets.map((line) => (
            <li
              key={line}
              className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
            >
              <span
                aria-hidden
                className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {block.rows && block.rows.length > 0 ? (
        <dl className="grid gap-2.5 pt-1">
          {block.rows.map((row) => (
            <div
              key={`${row.label}-${row.value}`}
              className="rounded-xl border border-border/70 bg-card/70 px-4 py-3"
            >
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 text-[14px] font-medium leading-relaxed text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Single numbered section.
 * ──────────────────────────────────────────────────────────────────────── */
function TermsSectionCard({ section }: { section: TermsSection }) {
  const Icon = section.icon;
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="scroll-mt-28 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-app-soft backdrop-blur-sm sm:p-8"
    >
      <header className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Section {section.number}
          </span>
          <h2
            id={`${section.id}-heading`}
            className="font-display mt-1 text-xl font-bold tracking-tight text-foreground sm:text-[1.5rem]"
          >
            {section.title}
          </h2>
          {section.intro ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {section.intro}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-6 space-y-6 border-t border-border/60 pt-6">
        {section.blocks.map((block, i) => (
          <TermsBlock key={`${section.id}-block-${i}`} block={block} />
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Page body — wraps ToC + sections.
 * ──────────────────────────────────────────────────────────────────────── */
export function TermsContent() {
  return (
    <section className="relative bg-background py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-secondary/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <TableOfContents />

          <div className="space-y-6 sm:space-y-7">
            {TERMS_SECTIONS.map((section) => (
              <TermsSectionCard key={section.id} section={section} />
            ))}

            {/* Effective-date callout */}
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.05] px-6 py-5 text-center shadow-app-soft">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                These Terms are effective as of{" "}
                <span className="font-semibold text-foreground">
                  {TERMS_EFFECTIVE_DATE}
                </span>{" "}
                and apply to your use of the Service from that date forward.
              </p>
            </div>

            {/* Contact CTA */}
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-app-soft backdrop-blur-sm sm:p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    Need clarification on anything?
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
                    Our legal &amp; support team will walk you through any
                    section.
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0">
                  <Link href="/contact-us">
                    <Mail className="h-4 w-4" aria-hidden />
                    Contact our team
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqs, type FaqItem } from "./constants";

function FaqColumn({ items }: { items: FaqItem[] }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card px-5 shadow-app-soft sm:px-6">
      {items.map((item, i) => (
        <details
          key={item.q}
          className={cn(
            "group border-b border-border/70 py-4 [&[open]>summary>svg]:rotate-180",
            i === items.length - 1 && "border-b-0",
          )}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground sm:text-[15px]">
            <span>{item.q}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
              aria-hidden
            />
          </summary>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqGrid() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Common questions about Autolokate.</p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <FaqColumn items={faqs.left} />
          <FaqColumn items={faqs.right} />
        </div>
      </div>
    </section>
  );
}

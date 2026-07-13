import { ChevronDown } from "lucide-react";
import { faqs, type FaqItem } from "./constants";

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <details className="group rounded-[0.9rem] border border-[#eceef1] bg-[#f6f7f9] px-5 py-4 [&[open]>summary>svg]:rotate-180">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#0a0a0a] sm:text-[15px]">
        <span>{item.q}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[#6b7280] transition-transform duration-200"
          aria-hidden
        />
      </summary>
      <p className="mt-3 text-[13px] leading-relaxed text-[#52525b]">{item.a}</p>
    </details>
  );
}

export function FaqGrid() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span
            className="mx-auto mb-4 block h-[3px] w-8 rounded-full bg-[var(--al-signal-green)]"
            aria-hidden
          />
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#0a0a0a] sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Common questions about Autolokate.</p>
        </div>

        <div className="mt-10 grid items-start gap-4 lg:grid-cols-2 lg:gap-x-6">
          <div className="flex flex-col gap-4">
            {faqs.left.map((item) => (
              <FaqCard key={item.q} item={item} />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {faqs.right.map((item) => (
              <FaqCard key={item.q} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

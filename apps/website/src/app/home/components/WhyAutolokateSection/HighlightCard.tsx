import { cn } from "@/lib/utils";
import type { WhyHighlight } from "./types";

interface HighlightCardProps {
  highlight: WhyHighlight;
  className?: string;
}

export function HighlightCard({ highlight, className }: HighlightCardProps) {
  const { title, body, Icon } = highlight;

  return (
    <article
      className={cn(
        "relative z-10 flex h-full flex-col items-center rounded-2xl border border-border/80 bg-card px-4 py-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-5 sm:py-7",
        className,
      )}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white"
        aria-hidden
      >
        <Icon className="h-5 w-5 stroke-[1.75]" />
      </span>
      <h3 className="font-display mt-4 text-sm font-bold leading-snug text-foreground sm:text-[0.9375rem]">
        {title}
      </h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

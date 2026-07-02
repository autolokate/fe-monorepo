import { cn } from "@/lib/utils";
import type { WhyHighlight } from "./types";
import styles from "./index.module.css";

interface HighlightCardProps {
  highlight: WhyHighlight;
  className?: string;
}

export function HighlightCard({ highlight, className }: HighlightCardProps) {
  const { title, body, Icon } = highlight;

  return (
    <article
      className={cn(
        `${styles.featureCard} flex h-full items-start gap-4 rounded-2xl px-5 py-5 sm:px-6 sm:py-6`,
        className,
      )}
    >
      <span
        className={`${styles.iconBadge} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl`}
        aria-hidden
      >
        <Icon className="h-5 w-5 stroke-[1.75]" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-bold leading-snug text-foreground sm:text-base">
          {title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}

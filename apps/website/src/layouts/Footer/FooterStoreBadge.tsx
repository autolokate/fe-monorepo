import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FooterStoreBadgeProps {
  href: string;
  topLabel: string;
  bottomLabel: string;
  icon: ReactNode;
  className?: string;
}

export function FooterStoreBadge({
  href,
  topLabel,
  bottomLabel,
  icon,
  className,
}: FooterStoreBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${topLabel} ${bottomLabel}`}
      className={cn(
        "inline-flex h-11 w-fit max-w-full shrink-0 items-center gap-2.5 rounded-xl border border-white/20 bg-transparent px-3.5 text-white transition-colors hover:border-white/35 hover:bg-white/5 sm:h-12 sm:px-4",
        className,
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center sm:h-7 sm:w-7">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[9px]">
          {topLabel}
        </span>
        <span className="-mt-0.5 text-[13px] font-bold tracking-tight sm:text-sm">
          {bottomLabel}
        </span>
      </span>
    </a>
  );
}

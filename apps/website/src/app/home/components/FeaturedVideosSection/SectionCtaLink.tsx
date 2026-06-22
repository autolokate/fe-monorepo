import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCtaLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  variant: "primary" | "secondary";
  external?: boolean;
}

export function SectionCtaLink({
  href,
  label,
  icon: Icon,
  variant,
  external,
}: SectionCtaLinkProps) {
  return (
    <Link
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      className={cn(
        "inline-flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-button px-3.5 py-3 text-[13px] font-semibold transition-colors sm:w-auto sm:gap-2.5 sm:px-4 sm:py-3.5 sm:text-sm",
        variant === "primary"
          ? "bg-foreground text-background hover:bg-foreground/90"
          : "border border-zinc-200 bg-white text-foreground hover:border-zinc-300 hover:bg-zinc-50/80",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
    </Link>
  );
}

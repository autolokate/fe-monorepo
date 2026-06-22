import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBrandLogo, isRemoteBrandLogo } from "@/lib/brand-assets";

export interface BrandLogoProps {
  brand: string;
  /** Logo height in pixels. Width is derived (square or wordmark). */
  size?: number;
  variant?: "square" | "wordmark";
  className?: string;
}

/**
 * Renders a brand mark on a neutral white tile. Falls back to a 2-3 letter
 * monogram derived from the brand name when no logo is available.
 */
export function BrandLogo({
  brand,
  size = 22,
  variant = "square",
  className,
}: BrandLogoProps) {
  const src = getBrandLogo(brand);
  const width = variant === "wordmark" ? Math.round(size * 2.8) : size;
  const height = size;

  if (!src) {
    const fallback = brand
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 3)
      .toUpperCase();
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg border border-border bg-white text-[10px] font-semibold text-muted-foreground",
          className,
        )}
        style={{ width, height }}
        aria-label={`${brand} logo`}
      >
        {variant === "wordmark" ? brand : fallback}
      </span>
    );
  }

  const remote = isRemoteBrandLogo(src);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-lg border border-border bg-white",
        className,
      )}
      style={{ width, height }}
      aria-label={`${brand} logo`}
    >
      <Image
        src={src}
        alt={`${brand} logo`}
        fill
        className="object-contain p-1"
        sizes={`${Math.max(width, 24)}px`}
        unoptimized={remote}
      />
    </span>
  );
}

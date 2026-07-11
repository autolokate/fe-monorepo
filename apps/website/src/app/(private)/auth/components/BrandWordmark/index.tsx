import { cn } from "@/lib/utils";

const LOGO_ON_DARK_BG = "/brand/al-logo-dark.svg";
const LOGO_ON_LIGHT_BG = "/brand/al-logo-light.svg";

interface BrandWordmarkProps {
  className?: string;
}

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image does not optimize SVG (served as-is), so it yields no LCP/bandwidth benefit */}
      <img
        src={LOGO_ON_DARK_BG}
        alt="Autolokate"
        width={140}
        height={133}
        draggable={false}
        className={cn("theme-dark-only block h-8 w-auto sm:h-9", className)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image does not optimize SVG (served as-is), so it yields no LCP/bandwidth benefit */}
      <img
        src={LOGO_ON_LIGHT_BG}
        alt="Autolokate"
        width={140}
        height={133}
        draggable={false}
        className={cn("theme-light-only block h-8 w-auto sm:h-9", className)}
      />
    </>
  );
}

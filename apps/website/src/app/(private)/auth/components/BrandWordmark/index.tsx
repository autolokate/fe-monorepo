import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_DARK_SRC = "https://autolokate.com/autolokate_dark.png";
const LOGO_LIGHT_SRC = "https://autolokate.com/autolokate_light.png";

interface BrandWordmarkProps {
  className?: string;
}

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <>
      <Image
        src={LOGO_DARK_SRC}
        alt="Autolokate"
        width={140}
        height={36}
        priority
        className={cn("theme-dark-only", className)}
      />
      <Image
        src={LOGO_LIGHT_SRC}
        alt="Autolokate"
        width={140}
        height={36}
        priority
        className={cn("theme-light-only", className)}
      />
    </>
  );
}

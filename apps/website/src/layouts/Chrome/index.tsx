"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Footer } from "@/layouts/Footer";
import { Header, PremiumHeader } from "@/layouts/Header";

/**
 * Conditional site chrome. Routes under `/auth/**` are full-bleed flows
 * (login, signup, OTP verify) and shouldn't render the marketing header
 * or footer, so this wrapper opts out for those paths.
 */
export function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isBareLayout = pathname.startsWith("/auth/");
  const isHome = pathname === "/";

  if (isBareLayout) {
    return <main className="relative min-h-screen min-w-0">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen min-w-0 flex-col">
      {isHome ? <PremiumHeader overDarkHero /> : <Header />}
      <main
        className={cn(
          "relative min-w-0 flex-1",
          !isHome && "pt-14 sm:pt-16",
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

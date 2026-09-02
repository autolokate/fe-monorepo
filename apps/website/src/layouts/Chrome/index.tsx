'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { Footer } from '@/layouts/Footer';
import { Header } from '@/layouts/Header';

/**
 * Conditional site chrome. Routes under `/auth/**` are full-bleed flows
 * (login, signup, OTP verify) and shouldn't render the marketing header
 * or footer, so this wrapper opts out for those paths.
 * Homepage renders its own integrated hero navigation.
 */
export function Chrome({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- usePathname() is typed string but can be null in practice; keep the fallback
  const pathname = usePathname() ?? '/';
  const isBareLayout = pathname.startsWith('/auth/');
  const isHome = pathname === '/';

  if (isBareLayout) {
    return <main className="relative min-h-screen min-w-0">{children}</main>;
  }

  if (isHome) {
    return (
      <div className="relative flex min-h-screen min-w-0 flex-col bg-white">
        <main className="relative min-w-0 flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen min-w-0 flex-col bg-[var(--website-canvas)]">
      <Header />
      <main className="relative min-w-0 flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

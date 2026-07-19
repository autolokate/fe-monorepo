import type { ReactNode } from 'react';

/**
 * Purchase-journey shell — a distraction-free, secure checkout surface rendered
 * without the marketing Chrome (Header / Footer). Each page in the journey
 * renders its own header + progress UI.
 */
export default function PurchaseJourneyLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen min-w-0 bg-background">{children}</div>;
}

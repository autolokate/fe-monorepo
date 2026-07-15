import type { ReactNode } from 'react';

/**
 * Focused checkout shell — deliberately renders without the marketing Chrome
 * (Header / Footer / MobileBottomNav) so the purchase flow reads as a
 * distraction-free, secure checkout. The flow renders its own CheckoutHeader.
 */
export default function PurchaseLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen min-w-0 bg-background">{children}</div>;
}

'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessOverlayProps {
  /** When false, nothing is rendered. */
  active: boolean;
  /** Short status shown under the spinner. */
  label: string;
  className?: string;
}

/**
 * Full-viewport blocker used while an API call or route handoff is in flight
 * so the previous screen cannot be tapped again and the wait is obvious.
 */
export function ProcessOverlay({ active, label, className }: ProcessOverlayProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/50 px-6 backdrop-blur-[2px]',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-white" aria-hidden />
      <p className="mt-3 text-center text-sm font-medium text-white">{label}</p>
    </div>
  );
}

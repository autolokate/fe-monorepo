import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepArrowProps {
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export function StepArrow({ className, direction = 'horizontal' }: StepArrowProps) {
  if (direction === 'vertical') {
    return (
      <span aria-hidden className={cn('flex items-center justify-center text-black/25', className)}>
        <ChevronRight className="h-4 w-4 rotate-90" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center px-0.5 text-black/25', className)}
    >
      <span className="mr-0.5 hidden h-px w-3 border-t border-black/20 sm:block" />
      <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
    </span>
  );
}

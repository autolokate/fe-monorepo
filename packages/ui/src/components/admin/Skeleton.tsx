import { cn } from '../../utils/cn';
import './Skeleton.css';

export type AlSkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'pill';
};

export function AlSkeleton({ className, width, height, rounded = 'md' }: AlSkeletonProps) {
  return (
    <span
      className={cn('al-skeleton', `al-skeleton--${rounded}`, className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}

export type AlProgressProps = {
  value: number;
  max?: number;
  label?: string;
};

export function AlProgress({ value, max = 100, label }: AlProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className="al-progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className="al-progress__bar" style={{ width: `${String(percent)}%` }} />
    </div>
  );
}

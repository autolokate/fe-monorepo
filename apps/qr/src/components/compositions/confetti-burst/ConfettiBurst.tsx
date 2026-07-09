import { useMemo, type CSSProperties } from 'react';

import './confetti-burst.css';

export type ConfettiBurstProps = {
  active?: boolean;
  particleCount?: number;
  className?: string;
};

/** CSS confetti burst — particles radiate from center (50%, 50%). */
export function ConfettiBurst({
  active = true,
  particleCount = 28,
  className,
}: ConfettiBurstProps) {
  const particles = useMemo(
    () => Array.from({ length: particleCount }, (_, index) => index),
    [particleCount],
  );

  if (!active) {
    return null;
  }

  return (
    <div className={className ? `ob-confetti ${className}` : 'ob-confetti'} aria-hidden>
      {particles.map((index) => (
        <span
          key={index}
          className="ob-confetti__particle"
          style={
            {
              '--ob-confetti-i': index,
              '--ob-confetti-count': particleCount,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';

/** Progress 0–1 from an absolute hold start timestamp — survives route handoff. */
export function useHoldProgressFrom(
  holdStartAt: number | null,
  active: boolean,
  durationMs: number,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active || holdStartAt === null) {
      setProgress(0);
      return;
    }

    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - holdStartAt;
      setProgress(Math.min(1, elapsed / durationMs));
      if (elapsed < durationMs) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [active, durationMs, holdStartAt]);

  return progress;
}

import { useEffect, useRef, useState } from 'react';

export function useHoldProgress(active: boolean, durationMs: number) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startRef.current = null;
      setProgress(0);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      if (startRef.current === null) {
        return;
      }
      const elapsed = now - startRef.current;
      setProgress(Math.min(1, elapsed / durationMs));
      if (elapsed < durationMs) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active, durationMs]);

  return progress;
}

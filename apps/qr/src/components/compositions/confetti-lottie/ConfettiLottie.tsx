import Lottie from 'lottie-react';
import { useSyncExternalStore } from 'react';

import confettiAnimation from '@/assets/lottie/confetti-celebration.json';
import './confetti-lottie.css';

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onStoreChange);
  return () => {
    media.removeEventListener('change', onStoreChange);
  };
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export type ConfettiLottieProps = {
  className?: string;
};

/** Full-screen confetti burst — plays once on mount (R10 payment success). */
export function ConfettiLottie({ className }: ConfettiLottieProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <Lottie
      animationData={confettiAnimation}
      loop={false}
      autoplay
      aria-hidden
      className={className ? `ob-confetti-lottie ${className}` : 'ob-confetti-lottie'}
    />
  );
}

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '../../../utils/cn';
import {
  startSosAlertTone,
  stopSosAlertTone,
  preloadSosAlertTone,
} from '../../../utils/sos-alert-tone';

import type { AlSosHoldButtonProps } from './SosHoldButton.types';
import './SosHoldButton.css';

const HOLD_CIRCUMFERENCE = 2 * Math.PI * 110;

function isIosDevice() {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))
  );
}

function triggerHaptic(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}

/** Figma 1078:2456–2459 · 848:278 — SOS hold-to-send control. */
export function AlSosHoldButton({
  holding = false,
  progress = 0,
  onHoldStart,
  onHoldEnd,
  playAlertTone = false,
  className,
  label = 'Hold to\nsend help',
  hint = 'Press and hold to confirm',
}: AlSosHoldButtonProps) {
  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const useRingProgressRef = useRef(isIosDevice());

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const isComplete = clampedProgress >= 1;
  const dashOffset = HOLD_CIRCUMFERENCE * (1 - clampedProgress);

  useEffect(() => {
    preloadSosAlertTone();
    return () => {
      stopSosAlertTone();
    };
  }, []);

  useEffect(() => {
    if (!playAlertTone) {
      return undefined;
    }

    startSosAlertTone();
    return () => {
      stopSosAlertTone();
    };
  }, [playAlertTone]);

  useEffect(() => {
    if (isComplete && holding && !completedRef.current) {
      completedRef.current = true;
      triggerHaptic([12, 40, 12]);
    }
    if (!holding) {
      completedRef.current = false;
    }
  }, [holding, isComplete]);

  const handleStart = useCallback(() => {
    holdingRef.current = true;
    triggerHaptic(8);
    startSosAlertTone();
    onHoldStart?.();
  }, [onHoldStart]);

  const handleEnd = useCallback(() => {
    if (!holdingRef.current) {
      return;
    }
    holdingRef.current = false;
    if (!playAlertTone) {
      stopSosAlertTone();
    }
    onHoldEnd?.();
  }, [onHoldEnd, playAlertTone]);

  return (
    <div
      className={cn(
        'al-sos-hold',
        holding && 'al-sos-hold--holding',
        isComplete && 'al-sos-hold--complete',
        className,
      )}
    >
      <div className="al-sos-hold__stage">
        <span className="al-sos-hold__aura" aria-hidden />
        <span className="al-sos-hold__ring-track" aria-hidden />
        {useRingProgressRef.current ? (
          <div
            className="al-sos-hold__progress-ring"
            style={
              { '--sos-hold-progress': `${String(clampedProgress * 360)}deg` } as CSSProperties
            }
            aria-hidden
          />
        ) : (
          <svg className="al-sos-hold__progress" viewBox="0 0 228 228" aria-hidden>
            <circle
              className="al-sos-hold__progress-arc"
              cx={114}
              cy={114}
              r={110}
              fill="none"
              strokeDasharray={HOLD_CIRCUMFERENCE}
              strokeDashoffset={holding ? dashOffset : HOLD_CIRCUMFERENCE}
            />
          </svg>
        )}
        <button
          type="button"
          className="al-sos-hold__disc"
          aria-label={holding ? 'Keep holding to send help' : 'Hold to send help'}
          onClick={(event) => {
            event.preventDefault();
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            handleStart();
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            handleEnd();
          }}
          onPointerLeave={handleEnd}
          onPointerCancel={handleEnd}
          onContextMenu={(event) => {
            event.preventDefault();
          }}
        >
          {holding ? 'Keep\nholding' : label}
        </button>
      </div>
      <p className="al-sos-hold__hint">{hint}</p>
    </div>
  );
}

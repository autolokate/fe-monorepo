import { useEffect } from 'react';
import { AlLogo } from '@autolokate/brand';
import { AlScreenBg, AlText } from '@autolokate/ui';

import { useThemeMode } from '@/hooks/useThemeMode.js';
import type { S0SplashScreenProps } from '../../types.js';

import './s0-splash.css';

const SPLASH_AUTO_MS = 1800;

/** S0 · Splash — Figma 27:98 */
export function S0SplashScreen({ onComplete }: S0SplashScreenProps) {
  const { themeMode } = useThemeMode();

  useEffect(() => {
    if (!onComplete) {
      return;
    }
    const timer = window.setTimeout(onComplete, SPLASH_AUTO_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AlScreenBg variant="protected" className="ob-splash">
      <div className="ob-splash__center">
        <AlLogo
          size={244}
          variant={themeMode === 'light' ? 'light' : 'dark'}
          aria-label="Autolokate"
        />
        <AlText tone="muted" className="ob-splash__tagline">
          Your car&apos;s daily companion
        </AlText>
      </div>
      <div className="ob-splash__loading" aria-hidden>
        <span className="ob-splash__loading-fill" />
      </div>
    </AlScreenBg>
  );
}

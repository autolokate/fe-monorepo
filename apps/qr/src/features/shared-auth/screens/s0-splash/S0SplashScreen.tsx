import { AlLogo } from '@autolokate/brand';
import { AlScreenBg, AlText } from '@autolokate/ui';

import { useThemeMode } from '@/hooks/useThemeMode';
import type { S0SplashScreenProps } from '../../types';

import './s0-splash.css';

/** S0 · Splash — Figma 27:98 (duration controlled by AppLaunchSplash bootstrap). */
export function S0SplashScreen(_props: S0SplashScreenProps) {
  const { themeMode } = useThemeMode();

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

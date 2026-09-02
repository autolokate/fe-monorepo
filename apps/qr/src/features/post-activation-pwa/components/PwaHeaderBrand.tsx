import { AlLogo } from '@autolokate/brand';

import { useThemeMode } from '@/hooks/useThemeMode';

/** PWA scan header — theme-aware Autolokate logo. */
export function PwaHeaderBrand() {
  const { themeMode } = useThemeMode();

  return (
    <div className="pwa-scan-shell__brand" aria-label="Autolokate">
      <AlLogo
        className="pwa-scan-shell__logo"
        size={40}
        variant={themeMode === 'dark' ? 'dark' : 'light'}
        aria-label="Autolokate"
      />
    </div>
  );
}

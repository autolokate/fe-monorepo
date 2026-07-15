import { AlLogo } from '@autolokate/brand';
import { AlButton, AlHeading, AlScreenBg, AlText } from '@autolokate/ui';

import { useThemeMode } from '@/hooks/useThemeMode';

import './PwaOfflineScreen.css';

type PwaOfflineScreenProps = {
  onRetry?: () => void;
};

/** In-app offline recovery — avoids white screen when shell is loaded but network drops. */
export function PwaOfflineScreen({ onRetry }: PwaOfflineScreenProps) {
  const { themeMode } = useThemeMode();

  return (
    <AlScreenBg variant="protected" className="pwa-offline-screen">
      <AlLogo
        className="pwa-offline-screen__logo"
        size={72}
        variant={themeMode === 'dark' ? 'dark' : 'light'}
        aria-label="Autolokate"
      />
      <AlHeading variant="h2">You&apos;re offline</AlHeading>
      <AlText tone="muted" className="pwa-offline-screen__description">
        Autolokate needs a connection to continue. Check your network, then try again.
      </AlText>
      <AlButton
        variant="primary"
        onClick={() => {
          if (onRetry) {
            onRetry();
            return;
          }
          window.location.reload();
        }}
      >
        Try again
      </AlButton>
    </AlScreenBg>
  );
}

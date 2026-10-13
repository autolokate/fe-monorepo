import { AlLogo } from '@autolokate/brand';
import { AlHeading, AlScreenBg, AlText } from '@autolokate/ui';

import { useThemeMode } from '@/hooks/useThemeMode';
import { PURCHASE_SUPPORT_EMAIL } from '../../features/qr-purchase/constants/purchase-support';

import './QrEntryScreen.css';

/** Shown at the universal entry (`/q`) when no QR code is present in the URL. */
export function QrEntryScreen() {
  const { themeMode } = useThemeMode();

  return (
    <AlScreenBg variant="protected" className="qr-entry-screen">
      <main className="qr-entry-screen__frame">
        <AlLogo
          className="qr-entry-screen__logo"
          size={72}
          variant={themeMode === 'dark' ? 'dark' : 'light'}
          aria-label="Autolokate"
        />
        <AlHeading variant="h1">Scan an Autolokate QR</AlHeading>
        <AlText tone="muted" className="qr-entry-screen__description">
          Point your phone camera at the Autolokate QR sticker on a vehicle to activate it or reach
          its owner.
        </AlText>
        <AlText tone="muted" className="qr-entry-screen__description">
          Need help? <a href={`mailto:${PURCHASE_SUPPORT_EMAIL}`}>{PURCHASE_SUPPORT_EMAIL}</a>
        </AlText>
      </main>
    </AlScreenBg>
  );
}

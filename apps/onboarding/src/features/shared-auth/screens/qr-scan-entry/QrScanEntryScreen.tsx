import { useCallback, useState } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlLogo } from '@autolokate/brand';
import { AlButton, AlHeading, AlIconButton, AlScreenBg, AlScreenSpinner, AlText } from '@autolokate/ui';

import { useThemeMode } from '@/hooks/useThemeMode.js';
import {
  extractQrCodeFromScan,
  isQrCodeScannerSupported,
  useQrCodeScanner,
} from '../../hooks/use-qr-code-scanner.js';

import './qr-scan-entry.css';

export type QrScanEntryScreenProps = {
  onQrCodeDetected: (code: string) => void;
};

function QrCodeScannerOverlay({
  onClose,
  scanner,
}: {
  onClose: () => void;
  scanner: ReturnType<typeof useQrCodeScanner>;
}) {
  const { state, errorMessage, start, stop, registerVideoElement } = scanner;

  const handleClose = () => {
    stop();
    onClose();
  };

  const showCamera = state === 'starting' || state === 'scanning';
  const showError = state === 'unsupported' || state === 'denied' || state === 'error';

  return (
    <div className="ob-qr-scan-scanner" role="dialog" aria-modal="true" aria-label="Scan QR code">
      <header className="ob-qr-scan-scanner__header">
        <AlIconButton
          icon={<AlIcon name="circle-x" size={24} aria-hidden />}
          label="Close scanner"
          onClick={handleClose}
        />
        <AlText variant="body" tone="muted">
          Scan sticker
        </AlText>
        <span className="ob-qr-scan-scanner__header-spacer" aria-hidden />
      </header>

      {showError ? (
        <div className="ob-qr-scan-scanner__error">
          <AlText tone="muted" align="center">
            {errorMessage}
          </AlText>
          {state !== 'unsupported' ? (
            <AlButton variant="primary" onClick={() => void start()}>
              Try again
            </AlButton>
          ) : null}
          <AlButton variant="secondary" onClick={handleClose}>
            Close
          </AlButton>
        </div>
      ) : (
        <>
          <div className="ob-qr-scan-scanner__viewport">
            <video
              ref={registerVideoElement}
              className="ob-qr-scan-scanner__video"
              playsInline
              muted
            />
            {state === 'starting' ? (
              <div className="ob-qr-scan-scanner__loading">
                <AlScreenSpinner size="lg" animated aria-label="Starting camera" />
              </div>
            ) : null}
            {showCamera ? <span className="ob-qr-scan-scanner__frame" aria-hidden /> : null}
          </div>
          <div className="ob-qr-scan-scanner__hint">
            <AlText tone="muted" align="center">
              Point your camera at the Autolokate QR sticker on the vehicle
            </AlText>
          </div>
        </>
      )}
    </div>
  );
}

/** Shown when `/journey/auth/mobile` is opened without `?qr_code=` and the user is not signed in. */
export function QrScanEntryScreen({ onQrCodeDetected }: QrScanEntryScreenProps) {
  const { themeMode } = useThemeMode();
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerSupported = isQrCodeScannerSupported();

  const handleRawScan = useCallback(
    (raw: string) => {
      const code = extractQrCodeFromScan(raw);
      if (code) {
        setScannerOpen(false);
        onQrCodeDetected(code);
      }
    },
    [onQrCodeDetected],
  );

  const scanner = useQrCodeScanner(handleRawScan);

  const handleOpenScanner = () => {
    setScannerOpen(true);
    void scanner.start();
  };

  const handleCloseScanner = () => {
    scanner.stop();
    setScannerOpen(false);
  };

  return (
    <>
      <AlScreenBg variant="protected" className="ob-qr-scan-entry-bg">
        <div className="ob-qr-scan-entry">
          <AlLogo
            className="ob-qr-scan-entry__logo"
            size={120}
            variant={themeMode === 'dark' ? 'dark' : 'light'}
            aria-label="Autolokate"
          />
          <AlHeading variant="h2" className="ob-qr-scan-entry__title">
            Please scan the QR
          </AlHeading>
          <AlText tone="muted" align="center" className="ob-qr-scan-entry__description">
            Scan the Autolokate sticker on the vehicle to start activation, emergency setup, or
            Park Me.
          </AlText>
          {scannerSupported ? (
            <AlButton
              className="ob-qr-scan-entry__cta"
              variant="primary"
              icon={<AlIcon name="scan-line" size={20} aria-hidden />}
              onClick={handleOpenScanner}
            >
              Scan QR code
            </AlButton>
          ) : (
            <AlText tone="muted" align="center" className="ob-qr-scan-entry__fallback">
              Open your camera app and scan the Autolokate QR sticker on the vehicle. You will
              return here automatically.
            </AlText>
          )}
        </div>
      </AlScreenBg>

      {scannerOpen ? (
        <QrCodeScannerOverlay
          scanner={scanner}
          onClose={handleCloseScanner}
        />
      ) : null}
    </>
  );
}

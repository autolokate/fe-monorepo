import { useCallback, useRef } from 'react';

import { compressCaptureImage } from '../utils/compress-capture-image.js';
import { logPhotoDiagnostic } from '../utils/pwa-photo-diagnostics.js';

export type CameraCaptureResult = {
  dataUrl: string;
  blob: Blob;
  originalBytes: number;
  compressedBytes: number;
};

export function useCameraCapture(routeId = 'camera') {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolverRef = useRef<((result: CameraCaptureResult | null) => void) | null>(null);
  const rejectRef = useRef<((reason: Error) => void) | null>(null);

  const ensureInput = useCallback(() => {
    if (inputRef.current) {
      return inputRef.current;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        logPhotoDiagnostic(routeId, 'capture_cancelled');
        resolverRef.current?.(null);
        resolverRef.current = null;
        rejectRef.current = null;
        input.value = '';
        return;
      }

      void compressCaptureImage(file)
        .then((compressed) => {
          logPhotoDiagnostic(routeId, 'capture_compressed', {
            originalBytes: compressed.originalBytes,
            compressedBytes: compressed.compressedBytes,
            dataUrlChars: compressed.dataUrl.length,
          });
          resolverRef.current?.(compressed);
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Photo compression failed';
          logPhotoDiagnostic(routeId, 'capture_failed', { message });
          rejectRef.current?.(new Error(message));
        })
        .finally(() => {
          resolverRef.current = null;
          rejectRef.current = null;
          input.value = '';
        });
    });

    document.body.appendChild(input);
    inputRef.current = input;
    return input;
  }, [routeId]);

  const capturePhoto = useCallback((): Promise<CameraCaptureResult | null> => {
    return new Promise((resolve, reject) => {
      resolverRef.current = resolve;
      rejectRef.current = reject;
      const input = ensureInput();
      input.click();
    });
  }, [ensureInput]);

  return { capturePhoto };
}

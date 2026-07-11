import jsQR from 'jsqr';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type BarcodeDetectorLike = {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike;

const SCAN_INTERVAL_MS = 200;
const MAX_SCAN_EDGE = 960;

function readBarcodeDetector(): BarcodeDetectorCtor | null {
  const ctor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return ctor ?? null;
}

function hasCameraSupport(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

function createBarcodeDetectorIfAvailable(): BarcodeDetectorLike | null {
  const Detector = readBarcodeDetector();
  if (!Detector) {
    return null;
  }

  try {
    return new Detector({ formats: ['qr_code'] });
  } catch {
    try {
      return new Detector();
    } catch {
      return null;
    }
  }
}

function captureVideoFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): boolean {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width === 0 || height === 0) {
    return false;
  }

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return false;
  }

  context.drawImage(video, 0, 0, width, height);
  return true;
}

function prepareScanCanvas(
  sourceCanvas: HTMLCanvasElement,
  scanCanvas: HTMLCanvasElement,
): CanvasRenderingContext2D | null {
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  if (sourceWidth === 0 || sourceHeight === 0) {
    return null;
  }

  const scale = Math.min(1, MAX_SCAN_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  if (scanCanvas.width !== width || scanCanvas.height !== height) {
    scanCanvas.width = width;
    scanCanvas.height = height;
  }

  const context = scanCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return null;
  }

  context.drawImage(sourceCanvas, 0, 0, width, height);
  return context;
}

function decodeWithJsQr(canvas: HTMLCanvasElement): string | null {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return null;
  }

  const { width, height } = canvas;
  if (width === 0 || height === 0) {
    return null;
  }

  const imageData = context.getImageData(0, 0, width, height);
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  const value = result?.data.trim();
  return value || null;
}

async function detectQrValue(
  detector: BarcodeDetectorLike | null,
  video: HTMLVideoElement,
  frameCanvas: HTMLCanvasElement,
  scanCanvas: HTMLCanvasElement,
): Promise<string | null> {
  if (!captureVideoFrame(video, frameCanvas)) {
    return null;
  }

  if (detector) {
    for (const source of [frameCanvas, video] as ImageBitmapSource[]) {
      try {
        const codes = await detector.detect(source);
        const value = codes.find((entry) => entry.rawValue?.trim())?.rawValue?.trim();
        if (value) {
          return value;
        }
      } catch {
        // fall through to jsQR
      }
    }
  }

  if (!prepareScanCanvas(frameCanvas, scanCanvas)) {
    return null;
  }

  return decodeWithJsQr(scanCanvas);
}

export type QrCodeScannerState =
  | 'idle'
  | 'starting'
  | 'scanning'
  | 'unsupported'
  | 'denied'
  | 'error';

/** True when the device can open a camera for in-app scanning. */
export function isQrCodeScannerSupported(): boolean {
  return hasCameraSupport();
}

export function useQrCodeScanner(onCode: (raw: string) => void) {
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const attachInFlightRef = useRef(false);
  const scanIntervalRef = useRef<number>(0);
  const scanInFlightRef = useRef(false);
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  const [state, setState] = useState<QrCodeScannerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getFrameCanvas = () => {
    if (!frameCanvasRef.current) {
      frameCanvasRef.current = document.createElement('canvas');
    }
    return frameCanvasRef.current;
  };

  const getScanCanvas = () => {
    if (!scanCanvasRef.current) {
      scanCanvasRef.current = document.createElement('canvas');
    }
    return scanCanvasRef.current;
  };

  const clearScanInterval = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = 0;
    }
    scanInFlightRef.current = false;
  }, []);

  const stop = useCallback(() => {
    clearScanInterval();
    attachInFlightRef.current = false;
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
    detectorRef.current = null;
    const video = videoElementRef.current;
    if (video) {
      video.srcObject = null;
    }
    setState('idle');
  }, [clearScanInterval]);

  const beginDetectionLoop = useCallback(
    (video: HTMLVideoElement, detector: BarcodeDetectorLike | null) => {
      if (scanIntervalRef.current) {
        return;
      }

      const frameCanvas = getFrameCanvas();
      const scanCanvas = getScanCanvas();

      const scan = async () => {
        if (!streamRef.current || scanInFlightRef.current) {
          return;
        }
        if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
          return;
        }

        scanInFlightRef.current = true;
        try {
          const value = await detectQrValue(detector, video, frameCanvas, scanCanvas);
          if (value) {
            stop();
            onCodeRef.current(value);
          }
        } catch {
          // keep scanning
        } finally {
          scanInFlightRef.current = false;
        }
      };

      void scan();
      scanIntervalRef.current = window.setInterval(() => {
        void scan();
      }, SCAN_INTERVAL_MS);
    },
    [stop],
  );

  const tryAttachVideo = useCallback(async () => {
    const video = videoElementRef.current;
    const stream = streamRef.current;
    if (!video || !stream || attachInFlightRef.current) {
      return false;
    }

    attachInFlightRef.current = true;
    try {
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');

      await Promise.race([
        video.play(),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            reject(new Error('Camera preview timed out'));
          }, 8000);
        }),
      ]);

      if (video.videoWidth === 0) {
        await new Promise<void>((resolve) => {
          const handleReady = () => {
            video.removeEventListener('loadeddata', handleReady);
            resolve();
          };
          video.addEventListener('loadeddata', handleReady);
          window.setTimeout(resolve, 1500);
        });
      }

      setState('scanning');
      beginDetectionLoop(video, detectorRef.current);
      return true;
    } catch {
      setState('error');
      setErrorMessage('Could not start the camera preview. Tap Try again.');
      return false;
    } finally {
      attachInFlightRef.current = false;
    }
  }, [beginDetectionLoop]);

  const registerVideoElement = useCallback(
    (node: HTMLVideoElement | null) => {
      videoElementRef.current = node;
      if (node) {
        void tryAttachVideo();
      }
    },
    [tryAttachVideo],
  );

  const releaseStream = useCallback(() => {
    clearScanInterval();
    attachInFlightRef.current = false;
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
    detectorRef.current = null;
    const video = videoElementRef.current;
    if (video) {
      video.srcObject = null;
    }
  }, [clearScanInterval]);

  const start = useCallback(async () => {
    releaseStream();

    if (!hasCameraSupport()) {
      setState('unsupported');
      setErrorMessage(
        'Camera scanning is not supported here. Open your phone camera app and scan the Autolokate sticker on the vehicle.',
      );
      return;
    }

    setState('starting');
    setErrorMessage(null);

    try {
      detectorRef.current = createBarcodeDetectorIfAvailable();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      await tryAttachVideo();
    } catch (error) {
      attachInFlightRef.current = false;
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setState('denied');
        setErrorMessage('Camera access is needed to scan the QR sticker.');
        return;
      }
      setState('error');
      setErrorMessage('Could not open the camera. Try again or scan with your camera app.');
    }
  }, [releaseStream, tryAttachVideo]);

  useLayoutEffect(() => {
    if (state !== 'starting' || !streamRef.current) {
      return;
    }

    void tryAttachVideo();
  }, [state, tryAttachVideo]);

  useEffect(() => () => {
    releaseStream();
  }, [releaseStream]);

  return { state, errorMessage, start, stop, registerVideoElement };
}

/** Extract `qr_code` (or legacy `code`) from a scanned URL or raw code string. */
export function extractQrCodeFromScan(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const fromQr = url.searchParams.get('q')?.trim();
    if (fromQr) {
      return fromQr;
    }
    const legacyQr = url.searchParams.get('qr_code')?.trim();
    if (legacyQr) {
      return legacyQr;
    }
    const legacy = url.searchParams.get('code')?.trim();
    if (legacy) {
      return legacy;
    }
  } catch {
    // not a URL — treat as opaque code
  }

  return trimmed;
}

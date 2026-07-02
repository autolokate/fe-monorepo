import { useCallback, useState } from 'react';

import { reportUserError } from '@/platform/feedback/report-user-error.js';
import { anonymousScannerRepository } from '@/platform/storage/repositories/anonymous-scanner-repository.js';
import { parkSessionRepository } from '@/platform/storage/repositories/park-session-repository.js';
import { uploadScanPhotoForSlot, scannerLogger, type ScanUploadKind } from '@/services/scanner/index.js';

import { usePwaScan, type PwaSessionPatch } from '../context/PwaScanContext.js';
import { useCameraCapture } from './use-camera-capture.js';
import { logPhotoDiagnostic } from '../utils/pwa-photo-diagnostics.js';

type PhotoField = 'parkMePhotos' | 'sosPhotos';
type PhotoIdField = 'parkMePhotoIds' | 'sosPhotoIds';

export type PwaPhotoUploadConfig = {
  kind: ScanUploadKind;
  photoIdsField: PhotoIdField;
};

export function usePwaPhotoCapture(
  routeId: string,
  field: PhotoField,
  upload?: PwaPhotoUploadConfig,
) {
  const { updateSession, storageError, clearStorageError } = usePwaScan();
  const { capturePhoto } = useCameraCapture(routeId);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const clearCaptureError = useCallback(() => {
    setCaptureError(null);
  }, []);

  const captureToSlot = useCallback(
    async (slot: string) => {
      setActiveSlot(slot);
      setCaptureError(null);
      logPhotoDiagnostic(routeId, 'capture_start', { slot });

      try {
        const result = await capturePhoto();
        if (!result?.dataUrl) {
          return;
        }

        const patch: PwaSessionPatch = (prev) => {
          if (field === 'parkMePhotos') {
            return {
              parkMePhotos: {
                ...prev.parkMePhotos,
                [slot]: result.dataUrl,
              },
              parkMePhotoIds: {
                ...prev.parkMePhotoIds,
                [slot]: null,
              },
            };
          }
          return {
            sosPhotos: {
              ...prev.sosPhotos,
              [slot]: result.dataUrl,
            },
            sosPhotoIds: {
              ...prev.sosPhotoIds,
              [slot]: null,
            },
          };
        };

        const saveResult = updateSession(patch);
        logPhotoDiagnostic(routeId, 'capture_saved', {
          slot,
          dataUrlChars: result.dataUrl.length,
          storageOk: saveResult.ok,
        });

        if (!saveResult.ok) {
          setCaptureError(saveResult.message);
          return;
        }

        if (!upload) {
          return;
        }

        const qrCode = anonymousScannerRepository.readQrCode();
        if (!qrCode) {
          setCaptureError('Missing QR code. Scan the sticker again.');
          return;
        }

        const bystanderSessionToken =
          upload.kind === 'park' ? parkSessionRepository.readToken() : null;
        if (upload.kind === 'park' && !bystanderSessionToken) {
          setCaptureError('Session expired. Verify your number again.');
          return;
        }

        const uploadResult = await uploadScanPhotoForSlot({
          kind: upload.kind,
          slot,
          qrCode,
          dataUrl: result.dataUrl,
          bystanderSessionToken,
        });

        if (!uploadResult.ok) {
          reportUserError(
            scannerLogger,
            'scan_photo_upload_failed',
            uploadResult.error,
            uploadResult.error.message,
          );
          setCaptureError(uploadResult.error.message);
          return;
        }

        updateSession((prev) => ({
          [upload.photoIdsField]: {
            ...(upload.photoIdsField === 'parkMePhotoIds' ? prev.parkMePhotoIds : prev.sosPhotoIds),
            [slot]: uploadResult.mediaId,
          },
        }));

        logPhotoDiagnostic(routeId, 'upload_complete', { slot, mediaId: uploadResult.mediaId });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Photo capture failed';
        setCaptureError(message);
        logPhotoDiagnostic(routeId, 'capture_threw', { message });
      } finally {
        setActiveSlot(null);
      }
    },
    [capturePhoto, field, routeId, updateSession, upload],
  );

  return {
    activeSlot,
    isUploading: activeSlot !== null,
    captureError,
    storageError,
    clearCaptureError,
    clearStorageError,
    captureToSlot,
  };
}

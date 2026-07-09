import type { QrAttachError } from '@/services/qr/qr-attach-errors';

export type AttachErrorPresentation = {
  title: string;
  description: string;
};

export function resolveAttachErrorPresentation(error: QrAttachError): AttachErrorPresentation {
  switch (error.code) {
    case 'already_attached':
      return {
        title: 'This QR code is already in use',
        description:
          error.message ||
          'This sticker is linked to another account or vehicle. Try a different QR code or contact us for help.',
      };
    case 'missing_qr_code':
      return {
        title: 'QR code missing',
        description:
          error.message ||
          'Scan your Autolokate sticker or open your purchase link again, then retry.',
      };
    case 'offline':
      return {
        title: 'You appear to be offline',
        description: 'Check your connection and try linking your vehicle again.',
      };
    case 'not_provisioned':
      return {
        title: 'QR code not ready yet',
        description: error.message || 'This QR code is not ready for activation. Please contact us.',
      };
    case 'invalid':
      return {
        title: 'Vehicle details could not be linked',
        description: error.message || 'Check your vehicle number and try again.',
      };
    default:
      return {
        title: 'Could not link your vehicle',
        description: error.message || 'Something went wrong while linking your QR code. Please try again.',
      };
  }
}

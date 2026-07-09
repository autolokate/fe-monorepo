import type { ProductAreaId } from '../types/flow.js';
import type { RegisteredFlowId } from '../flow/registry/build-registry.js';

export type FeatureDefinition = {
  id: ProductAreaId;
  flowId: RegisteredFlowId;
  label: string;
  description: string;
};

export const featureRegistry = {
  'shared-auth': {
    id: 'shared-auth',
    flowId: 'auth',
    label: 'Shared · Auth',
    description: 'Mobile capture, OTP verification, and account setup.',
  },
  'shared-legal': {
    id: 'shared-legal',
    flowId: 'legal',
    label: 'Shared · Legal',
    description: 'Terms of service and privacy consent.',
  },
  'qr-purchase': {
    id: 'qr-purchase',
    flowId: 'purchase',
    label: 'QR Activation + Purchase',
    description: 'Direct consumer QR activation with plan selection and payment.',
  },
  'qr-b2b': {
    id: 'qr-b2b',
    flowId: 'b2b',
    label: 'QR Activation — B2B',
    description: 'Organization-verified fleet QR activation.',
  },
  'qr-prepaid': {
    id: 'qr-prepaid',
    flowId: 'prepaid',
    label: 'QR Activation — B2B (Pre-Paid)',
    description: 'Voucher-based pre-paid B2B activation.',
  },
  'qr-b2b2c': {
    id: 'qr-b2b2c',
    flowId: 'b2b2c',
    label: 'QR Activation — B2B2C',
    description: 'Partner-bridge activation with offer selection.',
  },
  emergency: {
    id: 'emergency',
    flowId: 'emergency',
    label: 'Emergency + Rider',
    description: 'Emergency contacts and rider add-on after core activation.',
  },
} as const satisfies Record<ProductAreaId, FeatureDefinition>;

export type FeatureRegistry = typeof featureRegistry;

import type { StepId } from '@/types/flow.js';

import type { FlowConfig } from './types.js';
import { SHARED_PIPELINE_STEP_IDS } from './shared-pipeline.config.js';

const withSharedPipeline = (
  prefix: readonly StepId[],
  suffix: readonly StepId[],
): readonly StepId[] => [...prefix, ...SHARED_PIPELINE_STEP_IDS, ...suffix];

/** Declarative flow definitions — consumed by build-registry.ts */
export const flowsConfig = [
  {
    id: 'shared',
    productArea: 'shared-auth',
    label: 'Shared · Onboarding Pipeline',
    stepIds: SHARED_PIPELINE_STEP_IDS,
  },
  {
    id: 'purchase',
    productArea: 'qr-purchase',
    label: 'Consumer · QR Activation + Purchase',
    entryGuardIds: ['guard.qr-valid'],
    stepIds: withSharedPipeline(
      [],
      [
        'purchase.vehicle-number',
        'purchase.fetching-vehicle',
        'purchase.confirm-vehicle',
        'purchase.choose-plan',
        'purchase.rider-cover',
        'purchase.order-summary',
        'purchase.processing-payment',
        'purchase.payment-success',
      ],
    ),
  },
  {
    id: 'b2b',
    productArea: 'qr-b2b',
    label: 'Consumer · QR Activation — B2B',
    entryGuardIds: ['guard.qr-valid', 'guard.org-verified'],
    stepIds: withSharedPipeline(['b2b.org-verify'], ['b2b.fleet-assign', 'b2b.confirmation']),
  },
  {
    id: 'prepaid',
    productArea: 'qr-prepaid',
    label: 'Consumer · QR Activation — B2B (Pre-Paid)',
    entryGuardIds: ['guard.qr-valid', 'guard.voucher-valid'],
    stepIds: withSharedPipeline(
      [],
      ['prepaid.entry', 'prepaid.activation-code', 'prepaid.code-validation'],
    ),
  },
  {
    id: 'b2b2c',
    productArea: 'qr-b2b2c',
    label: 'Consumer · QR Activation — B2B2C',
    entryGuardIds: ['guard.qr-valid', 'guard.partner-session'],
    stepIds: withSharedPipeline(
      [],
      ['b2b2c.partner-bridge', 'b2b2c.offer-select', 'b2b2c.confirmation'],
    ),
  },
  {
    id: 'emergency',
    productArea: 'emergency',
    label: 'Consumer · Emergency + Rider',
    entryGuardIds: ['guard.qr-valid'],
    stepIds: [
      'emergency.rider-prompt',
      'emergency.rider-mobile',
      'emergency.rider-otp',
      'emergency.rider-name',
      'emergency.riders-summary',
      'emergency.contacts-empty',
      'emergency.contact-mobile',
      'emergency.contact-otp',
      'emergency.contact-name',
      'emergency.contacts-summary',
    ],
  },
  {
    id: 'auth',
    productArea: 'shared-auth',
    label: 'Shared · Auth',
    stepIds: ['shared.mobile', 'shared.otp', 'shared.account'],
  },
  {
    id: 'legal',
    productArea: 'shared-legal',
    label: 'Shared · Legal readers',
    stepIds: [],
  },
] as const satisfies FlowConfig;

export type FlowConfigId = (typeof flowsConfig)[number]['id'];

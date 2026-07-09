import type { AlIconName } from '@autolokate/icons';
import type { CompositionPageId, CoreComponentPageId, DocPageId } from './types';

export const compositionPages: CompositionPageId[] = [
  'composition-index',
  'composition-form-section',
  'composition-vehicle-info',
  'composition-contact-card',
  'composition-quick-action-row',
  'composition-bottom-nav',
  'composition-status-card',
  'composition-empty-content',
  'composition-step-progress',
  'composition-plan-card',
];

export const coreComponentPages: CoreComponentPageId[] = [
  'core-button',
  'core-status-pill',
  'core-text-field',
  'core-input',
  'core-otp-input',
  'core-toggle',
  'core-checkbox',
  'core-chip',
  'core-plate-input',
  'core-plan-card',
  'core-vehicle-rc-card',
  'core-avatar',
  'core-field',
  'core-quick-action',
  'core-step-progress',
  'core-bottom-nav',
  'core-status-bar',
  'core-text',
  'core-heading',
  'core-stack',
  'core-grid',
  'core-container',
  'core-divider',
  'core-icon-button',
];

export const figmaIcons = [
  'house',
  'store',
  'users',
  'circle-user',
  'scan-line',
  'square-parking',
  'receipt-text',
  'shield-check',
  'chevron-down',
  'bell',
  'car',
  'phone',
  'arrow-left',
  'plus',
  'user',
  'map-pin',
  'circle-check',
  'circle-x',
  'credit-card',
] as const satisfies readonly AlIconName[];

export type FigmaIconName = (typeof figmaIcons)[number];

export type IconSize = '16' | '20' | '24' | '32' | '48';

export const iconSizes: IconSize[] = ['16', '20', '24', '32', '48'];

export function isCoreComponentPage(page: DocPageId): page is CoreComponentPageId {
  return (coreComponentPages as readonly string[]).includes(page);
}

export function isCompositionPage(page: DocPageId): page is CompositionPageId {
  return (compositionPages as readonly string[]).includes(page);
}

export function isIconSize(value: string): value is IconSize {
  return (iconSizes as readonly string[]).includes(value);
}

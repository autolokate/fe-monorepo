export type CoreComponentPageId =
  | 'core-button'
  | 'core-status-pill'
  | 'core-text-field'
  | 'core-input'
  | 'core-otp-input'
  | 'core-toggle'
  | 'core-checkbox'
  | 'core-chip'
  | 'core-plate-input'
  | 'core-plan-card'
  | 'core-vehicle-rc-card'
  | 'core-avatar'
  | 'core-field'
  | 'core-quick-action'
  | 'core-step-progress'
  | 'core-bottom-nav'
  | 'core-status-bar'
  | 'core-text'
  | 'core-heading'
  | 'core-stack'
  | 'core-grid'
  | 'core-container'
  | 'core-divider'
  | 'core-icon-button'
  | 'admin-data-table';

export type CompositionPageId =
  | 'composition-index'
  | 'composition-form-section'
  | 'composition-vehicle-info'
  | 'composition-contact-card'
  | 'composition-quick-action-row'
  | 'composition-bottom-nav'
  | 'composition-status-card'
  | 'composition-empty-content'
  | 'composition-step-progress'
  | 'composition-plan-card';

export type DocPageId =
  | 'overview'
  | 'installation'
  | 'usage'
  | 'colors'
  | 'screen-backgrounds'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'motion'
  | 'brand-logo'
  | 'icons'
  | CoreComponentPageId
  | CompositionPageId;

export type PropRow = {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
};

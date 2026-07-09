import type { DocNavGroup } from './Sidebar.types';

export const DOCS_VERSION = 'v4.0.0-rc2';

export const navigationGroups: DocNavGroup[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    items: [
      { id: 'overview', label: 'Introduction', icon: 'house' },
      { id: 'installation', label: 'Installation', icon: 'circle-check' },
      { id: 'usage', label: 'Usage', icon: 'arrow-left' },
    ],
  },
  {
    id: 'foundations',
    label: 'Foundations',
    items: [
      { id: 'colors', label: 'Colors', icon: 'store' },
      { id: 'screen-backgrounds', label: 'Screen Backgrounds', icon: 'shield-check' },
      { id: 'typography', label: 'Typography', icon: 'car' },
      { id: 'spacing', label: 'Spacing', icon: 'square-parking' },
      { id: 'radius', label: 'Radius', icon: 'scan-line' },
      { id: 'motion', label: 'Motion', icon: 'bell' },
    ],
  },
  {
    id: 'brand',
    label: 'Brand',
    items: [{ id: 'brand-logo', label: 'Logo', icon: 'shield-check' }],
  },
  {
    id: 'icons',
    label: 'Icons',
    items: [{ id: 'icons', label: 'Icon Gallery', icon: 'scan-line' }],
  },
  {
    id: 'core-buttons',
    label: 'Core · Buttons',
    items: [{ id: 'core-button', label: 'AlButton', icon: 'circle-check' }],
  },
  {
    id: 'core-inputs',
    label: 'Core · Inputs',
    items: [
      { id: 'core-text-field', label: 'AlTextField', icon: 'phone' },
      { id: 'core-input', label: 'AlInput', icon: 'user' },
      { id: 'core-otp-input', label: 'AlOtpInput', icon: 'scan-line' },
      { id: 'core-toggle', label: 'AlToggle', icon: 'bell' },
      { id: 'core-checkbox', label: 'AlCheckbox', icon: 'circle-check' },
      { id: 'core-plate-input', label: 'AlPlateInput', icon: 'car' },
    ],
  },
  {
    id: 'core-selection',
    label: 'Core · Selection',
    items: [
      { id: 'core-chip', label: 'AlChip', icon: 'users' },
      { id: 'core-plan-card', label: 'AlPlanCard', icon: 'credit-card' },
    ],
  },
  {
    id: 'core-navigation',
    label: 'Core · Navigation',
    items: [
      { id: 'core-bottom-nav', label: 'AlBottomNav', icon: 'house' },
      { id: 'core-status-bar', label: 'AlStatusBar', icon: 'bell' },
    ],
  },
  {
    id: 'core-display',
    label: 'Core · Display',
    items: [
      { id: 'core-status-pill', label: 'AlStatusPill', icon: 'shield-check' },
      { id: 'core-avatar', label: 'AlAvatar', icon: 'circle-user' },
      { id: 'core-field', label: 'AlField', icon: 'receipt-text' },
      { id: 'core-vehicle-rc-card', label: 'AlVehicleRcCard', icon: 'car' },
      { id: 'core-quick-action', label: 'AlQuickAction', icon: 'plus' },
    ],
  },
  {
    id: 'core-progress',
    label: 'Core · Progress',
    items: [{ id: 'core-step-progress', label: 'AlStepProgress', icon: 'arrow-left' }],
  },
  {
    id: 'core-layout',
    label: 'Core · Layout',
    items: [
      { id: 'core-text', label: 'AlText', icon: 'receipt-text' },
      { id: 'core-heading', label: 'AlHeading', icon: 'car' },
      { id: 'core-stack', label: 'AlStack', icon: 'users' },
      { id: 'core-grid', label: 'AlGrid', icon: 'square-parking' },
      { id: 'core-container', label: 'AlContainer', icon: 'store' },
      { id: 'core-divider', label: 'AlDivider', icon: 'scan-line' },
      { id: 'core-icon-button', label: 'AlIconButton', icon: 'plus' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin Platform',
    items: [
      { id: 'admin-data-table', label: 'Admin components', icon: 'store' },
    ],
  },
  {
    id: 'composition-validation',
    label: 'Figma Composition Validation',
    items: [
      { id: 'composition-index', label: 'Overview', icon: 'shield-check' },
      { id: 'composition-form-section', label: 'Form section', icon: 'phone' },
      { id: 'composition-vehicle-info', label: 'Vehicle info', icon: 'car' },
      { id: 'composition-contact-card', label: 'Contact card', icon: 'circle-user' },
      { id: 'composition-quick-action-row', label: 'Quick action row', icon: 'scan-line' },
      { id: 'composition-bottom-nav', label: 'Bottom navigation', icon: 'house' },
      { id: 'composition-status-card', label: 'Status card', icon: 'shield-check' },
      { id: 'composition-empty-content', label: 'Empty content', icon: 'square-parking' },
      { id: 'composition-step-progress', label: 'Step progress', icon: 'arrow-left' },
      { id: 'composition-plan-card', label: 'Plan card', icon: 'credit-card' },
    ],
  },
];

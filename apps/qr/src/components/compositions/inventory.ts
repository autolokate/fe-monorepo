/**
 * Cross-flow composition inventory.
 * Identifies reusable UI groupings — NOT implemented here.
 * Candidates for promotion to @autolokate/ui when used in 2+ flows.
 */
export type CompositionId =
  | 'VehicleSummary'
  | 'PlanSummary'
  | 'PaymentSummary'
  | 'EmergencyContactSummary'
  | 'LegalConsentBlock'
  | 'OwnerContactCard'
  | 'FormFieldStack'
  | 'FlowProgressHeader'
  | 'ActivationSuccess'
  | 'CheckoutSummary'
  | 'PlanCarousel'
  | 'RiderSelectorRow'
  | 'PaymentStatusHero'
  | 'RelationshipSelector'
  | 'EmergencyContactRow'
  | 'AddContactRow';

export type CompositionDefinition = {
  id: CompositionId;
  description: string;
  dsComponents: readonly string[];
  usedInFlows: readonly string[];
  /** Promote to @autolokate/ui when stable across flows */
  promoteToCore: boolean;
  figmaReference?: string;
};

export const compositionInventory: Record<CompositionId, CompositionDefinition> = {
  VehicleSummary: {
    id: 'VehicleSummary',
    description: 'AlVehicleRcCard + confirmation CTA pattern',
    dsComponents: ['AlVehicleRcCard', 'AlField', 'AlChip', 'AlButton'],
    usedInFlows: ['purchase', 'b2b', 'prepaid', 'b2b2c', 'emergency'],
    promoteToCore: true,
    figmaReference: 'R05 · Vehicle RC card (170:79)',
  },
  PlanSummary: {
    id: 'PlanSummary',
    description: 'Selected AlPlanCard + feature recap',
    dsComponents: ['AlPlanCard', 'AlStack', 'AlText', 'AlButton'],
    usedInFlows: ['purchase', 'b2b2c', 'emergency'],
    promoteToCore: true,
    figmaReference: 'R06 · AlPlanCardW (231:80)',
  },
  PaymentSummary: {
    id: 'PaymentSummary',
    description: 'Line items, total, and pay CTA',
    dsComponents: ['AlField', 'AlDivider', 'AlText', 'AlButton'],
    usedInFlows: ['purchase'],
    promoteToCore: false,
  },
  EmergencyContactSummary: {
    id: 'EmergencyContactSummary',
    description: 'Contact rows with avatar and edit actions',
    dsComponents: ['AlAvatar', 'AlField', 'AlQuickAction', 'AlStack'],
    usedInFlows: ['emergency'],
    promoteToCore: true,
    figmaReference: 'Emergency contact card pattern',
  },
  LegalConsentBlock: {
    id: 'LegalConsentBlock',
    description: 'Checkbox + linked legal copy',
    dsComponents: ['AlCheckbox', 'AlText', 'AlButton'],
    usedInFlows: ['purchase', 'b2b', 'prepaid', 'b2b2c', 'emergency'],
    promoteToCore: true,
  },
  OwnerContactCard: {
    id: 'OwnerContactCard',
    description: 'Avatar + owner field pairing',
    dsComponents: ['AlAvatar', 'AlField', 'AlStack'],
    usedInFlows: ['purchase', 'b2b', 'prepaid', 'b2b2c'],
    promoteToCore: false,
    figmaReference: 'ui-preview · Contact card composition',
  },
  FormFieldStack: {
    id: 'FormFieldStack',
    description: 'Vertical input stack — phone, plate, name, OTP',
    dsComponents: ['AlTextField', 'AlPlateInput', 'AlInput', 'AlOtpInput', 'AlStack'],
    usedInFlows: ['purchase', 'b2b', 'prepaid', 'b2b2c', 'emergency'],
    promoteToCore: false,
    figmaReference: 'ui-preview · Form section composition',
  },
  FlowProgressHeader: {
    id: 'FlowProgressHeader',
    description: 'Back button + AlStepProgress + title',
    dsComponents: ['AlIconButton', 'AlStepProgress', 'AlHeading', 'AlStack'],
    usedInFlows: ['purchase', 'b2b', 'prepaid', 'b2b2c', 'emergency'],
    promoteToCore: false,
  },
  ActivationSuccess: {
    id: 'ActivationSuccess',
    description: 'Success icon, headline, and primary CTA',
    dsComponents: ['AlIcon', 'AlHeading', 'AlText', 'AlButton'],
    usedInFlows: ['purchase', 'b2b', 'prepaid', 'b2b2c', 'emergency'],
    promoteToCore: false,
  },
  PlanCarousel: {
    id: 'PlanCarousel',
    description: 'Horizontal scroll of AlPlanCard tiers with screen-level CTA',
    dsComponents: ['AlPlanCard', 'AlStack', 'AlButton', 'AlText'],
    usedInFlows: ['purchase'],
    promoteToCore: true,
    figmaReference: '232:102 · Choose plan carousel',
  },
  CheckoutSummary: {
    id: 'CheckoutSummary',
    description: 'AlField line items + divider + total row',
    dsComponents: ['AlField', 'AlDivider', 'AlHeading', 'AlText', 'AlButton'],
    usedInFlows: ['purchase'],
    promoteToCore: true,
    figmaReference: 'Checkout · order summary',
  },
  RiderSelectorRow: {
    id: 'RiderSelectorRow',
    description: 'AlToggle + AlChip rider count selector',
    dsComponents: ['AlToggle', 'AlChip', 'AlStack', 'AlText'],
    usedInFlows: ['purchase'],
    promoteToCore: true,
  },
  RelationshipSelector: {
    id: 'RelationshipSelector',
    description: 'Icon tile grid for Spouse · Parent · Child · Sibling · Friend · Other',
    dsComponents: ['AlIcon', 'AlText', 'AlStack'],
    usedInFlows: ['emergency'],
    promoteToCore: false,
    figmaReference: '374:71 · R3 · 371:1276 · E3',
  },
  EmergencyContactRow: {
    id: 'EmergencyContactRow',
    description: 'Verified emergency contact list row with avatar and relation',
    dsComponents: ['AlIcon', 'AlText', 'AlStack'],
    usedInFlows: ['emergency'],
    promoteToCore: false,
    figmaReference: '373:64 · E5',
  },
  AddContactRow: {
    id: 'AddContactRow',
    description: 'Dashed add-another-contact row for emergency summary',
    dsComponents: ['AlIcon', 'AlText'],
    usedInFlows: ['emergency'],
    promoteToCore: false,
    figmaReference: '373:64 · E5',
  },
  PaymentStatusHero: {
    id: 'PaymentStatusHero',
    description: 'Centered amount/status copy for payment processing and success',
    dsComponents: ['AlIcon', 'AlHeading', 'AlText', 'AlButton'],
    usedInFlows: ['purchase'],
    promoteToCore: false,
  },
};

export type CompositionInventory = typeof compositionInventory;

/** Compositions flagged for future @autolokate/ui promotion */
export const corePromotionCandidates = Object.values(compositionInventory).filter(
  (entry) => entry.promoteToCore,
);

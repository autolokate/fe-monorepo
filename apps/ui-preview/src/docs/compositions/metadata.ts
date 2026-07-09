import type { CompositionPageId } from '../types';

export type SpacingRhythmEntry = {
  token: string;
  px: number;
  usage: string;
};

export type CompositionMeta = {
  id: CompositionPageId;
  name: string;
  description: string;
  figmaNode: string;
  figmaSection: string;
  components: string[];
  spacingRhythm: SpacingRhythmEntry[];
  typography: string[];
  iconAlignment: string[];
  touchTargets: string[];
};

export const compositionMeta: CompositionMeta[] = [
  {
    id: 'composition-form-section',
    name: 'Form section',
    description:
      'INPUTS row from Figma DS — mobile number, plate, name, and OTP fields stacked for onboarding capture.',
    figmaNode: '487:36 · INPUTS row',
    figmaSection: 'INPUTS',
    components: ['AlTextField', 'AlPlateInput', 'AlInput', 'AlOtpInput', 'AlStack', 'AlContainer'],
    spacingRhythm: [
      { token: '--al-space-lg (16)', px: 16, usage: 'Field stack gap between inputs' },
      { token: '--al-space-xs (4)', px: 4, usage: 'Label-to-control gap inside fields' },
      { token: '--al-space-md (12)', px: 12, usage: 'OTP cell radius / prefix divider rhythm' },
    ],
    typography: [
      'AlTextField value — Inter 20px / 500',
      'AlPlateInput — Inter 24px / 700 uppercase',
      'AlInput value — Inter 16px / 400',
      'AlOtpInput digit — Inter 22px / 500',
    ],
    iconAlignment: ['No leading icons in this composition'],
    touchTargets: [
      'AlTextField control — 62px height',
      'AlPlateInput — 62px height',
      'AlInput — 62px height',
      'AlOtpInput cells — 60px height',
    ],
  },
  {
    id: 'composition-vehicle-info',
    name: 'Vehicle info section',
    description: 'RC card from R05 · Confirm vehicle — registration emphasis, verified chip, 2-column field grid.',
    figmaNode: '170:79 · RC card',
    figmaSection: 'R05 · Confirm vehicle',
    components: ['AlVehicleRcCard', 'AlField', 'AlChip'],
    spacingRhythm: [
      { token: '--al-comp-vehicle-rc-gap (16)', px: 16, usage: 'RC card internal stack' },
      { token: '--al-comp-vehicle-rc-row-gap (13)', px: 13, usage: 'Between field rows' },
      { token: '--al-comp-vehicle-rc-col-gap (16)', px: 16, usage: 'Between paired fields' },
      { token: '--al-comp-field-gap (2)', px: 2, usage: 'Label/value inside AlField' },
    ],
    typography: [
      'Registration number — Inter 29px / 700 uppercase',
      'AlField label — Inter 13px / 500 muted',
      'AlField value — Inter 16px / 600 / 24px line-height',
      'Verified chip — Inter 13px / 500',
    ],
    iconAlignment: ['14px circle-check centered in Verified chip'],
    touchTargets: ['Read-only RC card — no interactive targets in composition'],
  },
  {
    id: 'composition-contact-card',
    name: 'Contact card section',
    description: 'Avatar + owner field pairing from CONTENT & CARDS row.',
    figmaNode: '487:51 · AlAvatar + AlField',
    figmaSection: 'CONTENT & CARDS',
    components: ['AlAvatar', 'AlField', 'AlStack'],
    spacingRhythm: [
      { token: '--al-space-md (12)', px: 12, usage: 'Avatar-to-field horizontal gap' },
      { token: '--al-comp-field-gap (2)', px: 2, usage: 'Owner label/value gap' },
    ],
    typography: [
      'Owner label — Inter 13px / 500 muted',
      'Owner value — Inter 16px / 600',
    ],
    iconAlignment: ['AlAvatar user icon centered in 46px circle'],
    touchTargets: ['AlAvatar — 46px (below 48dp; display-only in this composition)'],
  },
  {
    id: 'composition-quick-action-row',
    name: 'Quick action row',
    description: 'Horizontally arranged AlQuickAction tiles from CONTENT & CARDS.',
    figmaNode: '487:51 · AlQuickAction',
    figmaSection: 'CONTENT & CARDS',
    components: ['AlQuickAction', 'AlStack', 'AlIcon'],
    spacingRhythm: [
      { token: '--al-space-sm (8)', px: 8, usage: 'Between quick action tiles' },
      { token: '--al-comp-quick-action-gap (10)', px: 10, usage: 'Icon-to-label inside tile' },
    ],
    typography: ['Quick action label — Inter 13px / 500'],
    iconAlignment: ['24px scan/plus icons centered above label'],
    touchTargets: ['AlQuickAction — 110px wide × 72px+ tall tile'],
  },
  {
    id: 'composition-bottom-nav',
    name: 'Bottom navigation states',
    description: 'AlBottomNav with each tab active — NAVIGATION & STRUCTURAL.',
    figmaNode: '487:52 · AlBottomNav',
    figmaSection: 'NAVIGATION & STRUCTURAL',
    components: ['AlBottomNav', 'AlStack', 'AlIcon'],
    spacingRhythm: [
      { token: '--al-space-lg (16)', px: 16, usage: 'Between state previews' },
      { token: '--al-comp-chip-gap (8)', px: 8, usage: 'Active tab icon-to-label gap' },
    ],
    typography: ['Active tab label — Inter 13px / 500'],
    iconAlignment: ['20px tab icons vertically centered; active tab shows label beside icon'],
    touchTargets: ['Nav items — 48px+ touch area via padding'],
  },
  {
    id: 'composition-status-card',
    name: 'Status card composition',
    description: 'Status pill variants grouped as a vehicle protection summary card.',
    figmaNode: '487:48 · SELECTION & STATUS',
    figmaSection: 'SELECTION & STATUS',
    components: ['AlStatusPill', 'AlChip', 'AlHeading', 'AlText', 'AlStack'],
    spacingRhythm: [
      { token: '--al-space-md (12)', px: 12, usage: 'Between status pills' },
      { token: '--al-space-lg (16)', px: 16, usage: 'Header to pill group' },
      { token: '--al-space-sm (8)', px: 8, usage: 'Chip row gap' },
    ],
    typography: [
      'Card title — AlHeading h4',
      'Subtitle — AlText body muted',
      'Pill/chip labels — Inter 13px / 500',
    ],
    iconAlignment: ['Signal dots and chip icons vertically centered with labels'],
    touchTargets: ['AlChip buttons — 32px+ height; pills are display-only'],
  },
  {
    id: 'composition-empty-content',
    name: 'Empty content composition',
    description: 'Centered empty state with icon, heading, helper text, and primary CTA.',
    figmaNode: 'DS pattern · empty placeholder',
    figmaSection: 'CONTENT & CARDS',
    components: ['AlIcon', 'AlHeading', 'AlText', 'AlButton', 'AlStack'],
    spacingRhythm: [
      { token: '--al-space-md (12)', px: 12, usage: 'Icon to heading' },
      { token: '--al-space-sm (8)', px: 8, usage: 'Heading to body' },
      { token: '--al-space-xl (24)', px: 24, usage: 'Body to CTA' },
    ],
    typography: [
      'Heading — AlHeading h3',
      'Body — AlText body muted',
      'CTA — AlButton Inter 16px / 600',
    ],
    iconAlignment: ['48px car icon centered above text stack'],
    touchTargets: ['AlButton primary — 58px height'],
  },
  {
    id: 'composition-step-progress',
    name: 'Step progress composition',
    description: 'Onboarding step indicator with meta label — steps 1–5 of 5.',
    figmaNode: '487:51 · AlStepProgress',
    figmaSection: 'CONTENT & CARDS',
    components: ['AlStepProgress', 'AlStack', 'AlHeading', 'AlText'],
    spacingRhythm: [
      { token: '--al-space-lg (16)', px: 16, usage: 'Between step state previews' },
      { token: '--al-comp-step-segment-gap (6)', px: 6, usage: 'Between progress segments' },
    ],
    typography: [
      'Step label — Inter 13px / 500',
      'Step count — Inter 13px / 500 muted',
    ],
    iconAlignment: ['No icons — segment track only'],
    touchTargets: ['Display-only progress indicator'],
  },
  {
    id: 'composition-plan-card',
    name: 'Plan card composition',
    description: 'AlPlanCardW Secure tier from R06 · Choose plan carousel with badge, includes pill, addon, and selected tick.',
    figmaNode: '232:102 · AlPlanCardW',
    figmaSection: 'R06 · Choose plan',
    components: ['AlPlanCard', 'AlIcon', 'AlStack'],
    spacingRhythm: [
      { token: '--al-comp-plan-card-gap (14)', px: 14, usage: 'Title / price / features stack' },
      { token: '--al-comp-plan-feature-gap (9)', px: 9, usage: 'Between feature rows' },
      { token: '--al-space-xs (4)', px: 4, usage: 'Feature list top padding' },
    ],
    typography: [
      'Plan name — Inter 20px / 600',
      'Price — Inter 30px / 700',
      'Feature — Inter 13px / 400',
    ],
    iconAlignment: ['15px circle-check icons vertically centered with feature text'],
    touchTargets: ['Display-only card in this composition'],
  },
];

export function getCompositionMeta(id: CompositionPageId): CompositionMeta | undefined {
  return compositionMeta.find((entry) => entry.id === id);
}

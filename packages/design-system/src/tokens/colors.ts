/**
 * Centralized brand primitives.
 * Raw hex values live here only — semantic tokens reference these via var().
 */
export const brand = {
  '--al-brand-black': '#0A0A0A',
  '--al-brand-white': '#FFFFFF',
} as const satisfies Record<string, string>;

/**
 * Traffic-signal accent palette — the only accent hues in the system.
 */
export const signal = {
  '--al-signal-red': '#E5342A',
  '--al-signal-red-bright': '#FF4A3D',
  '--al-signal-amber': '#F5A623',
  '--al-signal-green': '#1FA24A',
} as const satisfies Record<string, string>;

/**
 * Neutral ramp — surfaces and text derive from these, never ad-hoc greys.
 */
export const neutral = {
  '--al-neutral-0': '#FFFFFF',
  '--al-neutral-canvas': '#F4F6F9',
  '--al-neutral-50': '#F5F5F5',
  '--al-neutral-100': '#E8E8E8',
  '--al-neutral-plate': '#E4E4E8',
  '--al-neutral-plate-placeholder': '#8C8F94',
  '--al-neutral-300': '#C4C4C4',
  '--al-neutral-500': '#8A8A8A',
  '--al-neutral-700': '#4A4A4A',
  '--al-neutral-900': '#1A1A1A',
  '--al-neutral-950': '#0A0A0C',
  '--al-neutral-1000': '#0A0A0A',
} as const satisfies Record<string, string>;

/**
 * Signature gradients and material tints — used sparingly on hero surfaces only.
 */
export const gradients = {
  '--al-gradient-canvas': 'linear-gradient(180deg, #0A0A0A 0%, #141414 100%)',
  '--al-gradient-protected':
    'radial-gradient(ellipse at center, rgba(31, 162, 74, 0.12) 0%, rgba(31, 162, 74, 0) 70%)',
  '--al-gradient-ambient-protected':
    'radial-gradient(circle at 50% 50%, rgba(31, 162, 74, 0.08) 0%, rgba(31, 162, 74, 0) 100%)',
  '--al-gradient-ambient-attention':
    'radial-gradient(circle at 50% 50%, rgba(245, 166, 35, 0.08) 0%, rgba(245, 166, 35, 0) 100%)',
  '--al-gradient-ambient-emergency':
    'radial-gradient(circle at 50% 50%, rgba(229, 52, 42, 0.08) 0%, rgba(229, 52, 42, 0) 100%)',
  '--al-gradient-emergency':
    'radial-gradient(ellipse at center, rgba(229, 52, 42, 0.18) 0%, rgba(229, 52, 42, 0) 70%)',
  '--al-gradient-vehicle-rc-dark': 'linear-gradient(180deg, #252525 0%, #1a1a1a 100%)',
  '--al-gradient-vehicle-rc-light': 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
  '--al-gradient-plan-badge': 'rgba(31, 162, 74, 0.16)',
} as const satisfies Record<string, string>;

/**
 * Semantic color roles — light theme.
 * Components must reference these, not primitives directly.
 */
export const semanticLight = {
  '--al-color-background': 'var(--al-neutral-canvas)',
  '--al-color-surface': 'var(--al-neutral-0)',
  '--al-color-surface-variant': 'var(--al-neutral-50)',
  '--al-color-on-background': 'var(--al-neutral-1000)',
  '--al-color-on-surface': 'var(--al-neutral-1000)',
  '--al-color-on-surface-muted': 'var(--al-neutral-500)',
  '--al-color-outline': 'var(--al-neutral-300)',
  '--al-color-outline-strong': 'var(--al-neutral-500)',
  '--al-color-pill-surface': 'var(--al-neutral-50)',
  '--al-color-pill-on-surface': 'var(--al-neutral-1000)',
  '--al-color-primary': 'var(--al-brand-black)',
  '--al-color-on-primary': 'var(--al-brand-white)',
  '--al-color-secondary-border': 'var(--al-neutral-700)',
  '--al-color-emergency': 'var(--al-signal-red)',
  '--al-color-on-emergency': 'var(--al-brand-white)',
  '--al-color-success': 'var(--al-signal-green)',
  '--al-color-on-success': 'var(--al-brand-white)',
  '--al-color-warning': 'var(--al-signal-amber)',
  '--al-color-on-warning': 'var(--al-brand-black)',
  '--al-color-danger': 'var(--al-signal-red)',
  '--al-color-on-danger': 'var(--al-brand-white)',
  '--al-color-focus': 'var(--al-brand-black)',
  '--al-color-overlay': 'rgba(10, 10, 10, 0.48)',
  '--al-color-tier-safe': 'var(--al-signal-amber)',
  '--al-color-tier-secure': 'var(--al-signal-amber)',
  '--al-color-tier-shield': 'var(--al-signal-green)',
  '--al-color-tier-shield-plus': 'var(--al-signal-red)',
  '--al-color-plate-surface': 'var(--al-neutral-plate)',
  '--al-color-on-plate': 'var(--al-neutral-1000)',
} as const satisfies Record<string, string>;

/**
 * Semantic color roles — dark theme (first-class; hero/marketing default).
 */
export const semanticDark = {
  '--al-color-background': 'var(--al-neutral-950)',
  '--al-color-surface': 'var(--al-neutral-900)',
  '--al-color-surface-variant': 'var(--al-neutral-700)',
  '--al-color-on-background': 'var(--al-neutral-0)',
  '--al-color-on-surface': 'var(--al-neutral-0)',
  '--al-color-on-surface-muted': 'var(--al-neutral-500)',
  '--al-color-outline': 'var(--al-neutral-700)',
  '--al-color-outline-strong': 'var(--al-neutral-500)',
  '--al-color-pill-surface': 'var(--al-neutral-700)',
  '--al-color-pill-on-surface': 'var(--al-brand-white)',
  '--al-color-primary': 'var(--al-brand-white)',
  '--al-color-on-primary': 'var(--al-brand-black)',
  '--al-color-secondary-border': 'var(--al-neutral-700)',
  '--al-color-emergency': 'var(--al-signal-red-bright)',
  '--al-color-on-emergency': 'var(--al-brand-white)',
  '--al-color-success': 'var(--al-signal-green)',
  '--al-color-on-success': 'var(--al-brand-white)',
  '--al-color-warning': 'var(--al-signal-amber)',
  '--al-color-on-warning': 'var(--al-brand-black)',
  '--al-color-danger': 'var(--al-signal-red-bright)',
  '--al-color-on-danger': 'var(--al-brand-white)',
  '--al-color-focus': 'var(--al-brand-white)',
  '--al-color-overlay': 'rgba(10, 10, 10, 0.64)',
  '--al-color-tier-safe': 'var(--al-signal-amber)',
  '--al-color-tier-secure': 'var(--al-signal-amber)',
  '--al-color-tier-shield': 'var(--al-signal-green)',
  '--al-color-tier-shield-plus': 'var(--al-signal-red-bright)',
  '--al-color-plate-surface': 'var(--al-neutral-plate)',
  '--al-color-on-plate': 'var(--al-neutral-1000)',
} as const satisfies Record<string, string>;

/** Immutable primitive palette — does not change between themes. */
export const colorPrimitives = {
  ...brand,
  ...signal,
  ...neutral,
  ...gradients,
} as const;

/** Default export for backward-compatible flat color token access (primitives only). */
export const colors = colorPrimitives;

export type BrandToken = keyof typeof brand;
export type SignalToken = keyof typeof signal;
export type NeutralToken = keyof typeof neutral;
export type GradientToken = keyof typeof gradients;
export type SemanticColorToken = keyof typeof semanticLight;
export type ColorPrimitive = keyof typeof colorPrimitives;
export type ColorToken = ColorPrimitive;

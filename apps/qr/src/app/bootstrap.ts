/**
 * Application bootstrap sequence — implementation deferred.
 * Phase 4 will mount React root, providers, and router here.
 */
export type BootstrapPhase =
  | 'load-theme'
  | 'init-auth'
  | 'resolve-qr-entry'
  | 'select-flow'
  | 'mount-shell';

export const bootstrapSequence: readonly BootstrapPhase[] = [
  'load-theme',
  'init-auth',
  'resolve-qr-entry',
  'select-flow',
  'mount-shell',
];

export type BootstrapConfig = {
  defaultTheme: 'light' | 'dark';
  apiBaseUrl: string;
};

export const defaultBootstrapConfig: BootstrapConfig = {
  defaultTheme: 'light',
  apiBaseUrl: '/api',
};

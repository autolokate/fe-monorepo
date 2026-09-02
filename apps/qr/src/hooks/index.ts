/** App-level hooks — implementations deferred to Phase 4+ */
export type HookId = 'useFlowEngine' | 'useActiveStep' | 'useQrEntry' | 'useAuthSession';

export const hookInventory: readonly HookId[] = [
  'useFlowEngine',
  'useActiveStep',
  'useQrEntry',
  'useAuthSession',
];

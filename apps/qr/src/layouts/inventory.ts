/**
 * Layout slot inventory — no layout components yet.
 * All layouts consume @autolokate/ui primitives only.
 */
export type LayoutId =
  | 'AppShell'
  | 'FlowShell'
  | 'AuthShell'
  | 'LegalShell'
  | 'StepScreen';

export type LayoutDefinition = {
  id: LayoutId;
  slots: readonly ('header' | 'progress' | 'content' | 'footer' | 'status-bar')[];
  description: string;
};

export const layoutInventory: Record<LayoutId, LayoutDefinition> = {
  AppShell: {
    id: 'AppShell',
    slots: ['status-bar', 'content'],
    description: 'Root shell — theme, max-width container',
  },
  FlowShell: {
    id: 'FlowShell',
    slots: ['header', 'progress', 'content', 'footer'],
    description: 'Active flow wrapper with AlStepProgress and CTA footer',
  },
  AuthShell: {
    id: 'AuthShell',
    slots: ['header', 'content', 'footer'],
    description: 'Standalone auth segment without full flow chrome',
  },
  LegalShell: {
    id: 'LegalShell',
    slots: ['header', 'content', 'footer'],
    description: 'Legal consent with scrollable body',
  },
  StepScreen: {
    id: 'StepScreen',
    slots: ['content', 'footer'],
    description: 'Individual step viewport inside FlowShell',
  },
};

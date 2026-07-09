import { AlStack, AlText } from '@autolokate/ui';

import { FlowStepShell } from '@/components/flow-step-shell/index.js';
import type { PrepaidScreenState } from '../../types.js';
import { prepaidOrgName } from '../../data/activation-data.js';

export type PR01PrepaidEntryScreenProps = {
  state?: PrepaidScreenState;
};

export function PR01PrepaidEntryScreen({ state = 'default' }: PR01PrepaidEntryScreenProps) {
  const loading = state === 'loading';

  return (
    <FlowStepShell
      phase="prepaid"
      step={1}
      title="Pre-paid activation"
      description="your organisation has already paid"
      footerLabel={loading ? 'Loading…' : 'Continue'}
      footerLoading={loading}
    >
      <AlStack gap="md">
        <AlText>
          {prepaidOrgName} has pre-paid for Autolokate crash detection and emergency response.
          You&apos;ll enter an activation code on the next screen to link this device to your fleet
          plan.
        </AlText>
        <AlText tone="muted">
          After your code is verified, you&apos;ll confirm your vehicle, mobile number, and accept
          terms — the same steps as a standard activation, with no payment required.
        </AlText>
      </AlStack>
    </FlowStepShell>
  );
}

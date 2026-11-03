import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function SystemBroadcastPage() {
  return (
    <RequirePermission permission="users:write">
      <AlStack gap="md">
        <AlPageHeader title="System broadcast" />
      </AlStack>
    </RequirePermission>
  );
}

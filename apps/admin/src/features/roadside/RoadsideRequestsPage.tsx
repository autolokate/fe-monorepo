import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function RoadsideRequestsPage() {
  return (
    <RequirePermission permission="support:view">
      <AlStack gap="md">
        <AlPageHeader title="Roadside assistance" />
      </AlStack>
    </RequirePermission>
  );
}

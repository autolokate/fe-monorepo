import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function TaxiFleetPage() {
  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader title="Taxi fleet" />
      </AlStack>
    </RequirePermission>
  );
}

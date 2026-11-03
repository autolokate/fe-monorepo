import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function TaxiRefundsPage() {
  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader title="Taxi refunds" />
      </AlStack>
    </RequirePermission>
  );
}

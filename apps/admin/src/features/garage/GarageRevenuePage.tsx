import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function GarageRevenuePage() {
  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader title="Garage pass revenue" />
      </AlStack>
    </RequirePermission>
  );
}

import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function PlateScanningPage() {
  return (
    <RequirePermission permission="users:read">
      <AlStack gap="md">
        <AlPageHeader title="Plate scanning" />
      </AlStack>
    </RequirePermission>
  );
}

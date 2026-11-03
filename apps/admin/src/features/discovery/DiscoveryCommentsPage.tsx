import { AlPageHeader, AlStack } from '@autolokate/ui';

import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Placeholder — replaced by the full page. */
export function DiscoveryCommentsPage() {
  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader title="Comments" />
      </AlStack>
    </RequirePermission>
  );
}

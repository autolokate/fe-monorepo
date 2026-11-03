import { AlPageHeader, AlPageHeaderAction, AlStack, AlTabs } from '@autolokate/ui';
import { useQueryClient } from '@tanstack/react-query';

import { PlateScanningAbuseTab } from '@/features/plate-scanning/PlateScanningAbuseTab';
import { PlateScanningLookupsTab } from '@/features/plate-scanning/PlateScanningLookupsTab';
import {
  DuplicatePlansTab,
  PlateCollisionsTab,
  UnparsedPlatesTab,
} from '@/features/plate-scanning/PlateScanningPlatesTabs';
import { plateScanningKeys } from '@/hooks/plate-scanning/usePlateScanning';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

import '@/features/users/users-v4.css';

const TABS = ['lookups', 'abuse', 'collisions', 'unparsed', 'duplicates'] as const;
type PlateTab = (typeof TABS)[number];

/**
 * Number-plate scanning operations (phase A: alongside QR). Lookups and abuse review, plate keys that
 * collide or don't parse, and the one-active-plan-per-vehicle pre-deploy check.
 */
export function PlateScanningPage() {
  const [tab, setTab] = useUrlFilterState<PlateTab>('tab', 'lookups', TABS);
  const queryClient = useQueryClient();

  return (
    <RequirePermission permission="users:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Plate scanning"
          description="Plate lookups, abuse flags, plate-key collisions and unparsed registrations. Plates appear only as HMACs in lookup logs."
          actions={
            <AlPageHeaderAction
              label="Refresh"
              variant="secondary"
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: plateScanningKeys.all });
              }}
            />
          }
        />
        <div data-testid="plate-scanning-tabs">
          <AlTabs
            ariaLabel="Plate scanning sections"
            value={tab}
            onValueChange={(next) => {
              setTab(next as PlateTab);
            }}
            items={[
              { id: 'lookups', label: 'Lookups', content: <PlateScanningLookupsTab /> },
              { id: 'abuse', label: 'Abuse flags', content: <PlateScanningAbuseTab /> },
              { id: 'collisions', label: 'Plate collisions', content: <PlateCollisionsTab /> },
              { id: 'unparsed', label: 'Unparsed plates', content: <UnparsedPlatesTab /> },
              { id: 'duplicates', label: 'Duplicate plans', content: <DuplicatePlansTab /> },
            ]}
          />
        </div>
      </AlStack>
    </RequirePermission>
  );
}

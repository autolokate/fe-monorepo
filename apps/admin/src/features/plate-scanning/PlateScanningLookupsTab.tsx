import {
  ADMIN_SCAN_LOOKUP_RESULTS,
  type AdminScanLookupDto,
  type AdminScanLookupResult,
} from '@autolokate/api-client';
import { AlButton, AlDataTable, AlErrorState, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { OwnerAccountLink } from '@/features/vehicles/plate-vehicle-columns';
import { LOOKUP_LIMIT, useScanLookups } from '@/hooks/plate-scanning/usePlateScanning';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { useUrlTextState } from '@/platform/state/useUrlTextState';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

export const HOUR_OPTIONS = [
  { value: '1', label: '1 h' },
  { value: '24', label: '24 h' },
  { value: '72', label: '3 days' },
  { value: '168', label: '7 days' },
] as const;
export type HourOption = (typeof HOUR_OPTIONS)[number]['value'];
export const HOUR_VALUES = HOUR_OPTIONS.map((option) => option.value);

const RESULT_FILTERS: { value: AdminScanLookupResult | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  ...ADMIN_SCAN_LOOKUP_RESULTS.map((value) => ({ value, label: humanizeAdminLabel(value) })),
];
const RESULT_VALUES = RESULT_FILTERS.map((option) => option.value);

const RESULT_TONE: Record<AdminScanLookupResult, AdminStatusChipTone> = {
  MATCH: 'active',
  NO_MATCH: 'none',
  RETRY_LATER: 'draft',
  STEP_UP: 'draft',
  INVALID: 'none',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ScannerCell({
  accountId,
  webSessionId,
}: {
  accountId: string | null;
  webSessionId: string | null;
}) {
  if (accountId) return <OwnerAccountLink accountId={accountId} />;
  if (webSessionId) {
    return (
      <span className="admin-v4-stack">
        <span>Web session</span>
        <span className="admin-v4-stack__secondary admin-mono" title={webSessionId}>
          {shortAdminId(webSessionId)}
        </span>
      </span>
    );
  }
  return <>—</>;
}

/** Every plate lookup (app, web, legacy QR). Plates are never shown — only their HMAC. */
export function PlateScanningLookupsTab() {
  const [result, setResult] = useUrlFilterState<AdminScanLookupResult | 'ALL'>(
    'result',
    'ALL',
    RESULT_VALUES,
  );
  const [hours, setHours] = useUrlFilterState<HourOption>('hours', '24', HOUR_VALUES);
  // The applied scanner filter lives in the URL (`?account=`) like the other filters; a malformed
  // value in a pasted URL is ignored rather than sent to the API.
  const [urlAccount, setAccountId] = useUrlTextState('account');
  const accountId = UUID.test(urlAccount.trim()) ? urlAccount.trim() : '';
  const [accountDraft, setAccountDraft] = useState(accountId);
  const accountInvalid = accountDraft.trim().length > 0 && !UUID.test(accountDraft.trim());

  const lookups = useScanLookups({ accountId, result, hours: Number(hours) });
  const rows = lookups.data ?? [];

  const columns = useMemo<ColumnDef<AdminScanLookupDto>[]>(
    () => [
      {
        id: 'createdAt',
        header: 'When',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'result',
        header: 'Result',
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.result)}
            tone={RESULT_TONE[row.original.result]}
          />
        ),
      },
      {
        id: 'scanner',
        header: 'Scanner',
        accessorFn: (row) => row.accountId ?? row.webSessionId ?? '',
        cell: ({ row }) => (
          <ScannerCell
            accountId={row.original.accountId}
            webSessionId={row.original.webSessionId}
          />
        ),
      },
      {
        id: 'channel',
        header: 'Channel / source',
        accessorFn: (row) => `${row.channel} ${row.source}`,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span>{humanizeAdminLabel(row.original.channel)}</span>
            <span className="admin-v4-stack__secondary">
              {humanizeAdminLabel(row.original.source)}
            </span>
          </span>
        ),
      },
      { accessorKey: 'score', header: 'Abuse score' },
      {
        id: 'attestation',
        header: 'Attestation · step-up',
        accessorFn: (row) => row.attestation,
        cell: ({ row }) => (
          <span className="admin-v4-stack">
            <span>{humanizeAdminLabel(row.original.attestation)}</span>
            <span className="admin-v4-stack__secondary">
              {row.original.stepUpPassed
                ? `Step-up: ${humanizeAdminLabel(row.original.stepUpPassed)}`
                : 'No step-up'}
            </span>
          </span>
        ),
      },
      {
        id: 'vehicle',
        header: 'Matched vehicle',
        accessorFn: (row) => row.vehicleId ?? '',
        cell: ({ row }) =>
          row.original.vehicleId ? (
            <span className="admin-mono" title={row.original.vehicleId}>
              {shortAdminId(row.original.vehicleId)}
            </span>
          ) : (
            '—'
          ),
      },
      {
        id: 'flags',
        header: 'Flags',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="admin-v4-tags">
            {row.original.ambiguous ? (
              <span className="admin-v4-tag admin-v4-tag--warning">Ambiguous</span>
            ) : null}
            {row.original.hotPlate ? (
              <span className="admin-v4-tag admin-v4-tag--danger">Hot plate</span>
            ) : null}
            {!row.original.ambiguous && !row.original.hotPlate ? '—' : null}
          </span>
        ),
      },
      {
        id: 'plateHmac',
        header: 'Plate HMAC',
        accessorFn: (row) => row.plateHmac ?? '',
        cell: ({ row }) =>
          row.original.plateHmac ? (
            <span className="admin-mono" title={row.original.plateHmac}>
              {row.original.plateHmac.slice(0, 10)}…
            </span>
          ) : (
            '—'
          ),
      },
    ],
    [],
  );

  if (lookups.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Plate lookups"
        endpoint="GET /admin/v1/scan/lookups"
        description="The plate lookup log is not available on this server yet."
      />
    );
  }

  return (
    <AdminDataBlock
      filters={
        <>
          <AdminFilterField label="Result">
            <AdminFilterChips
              options={RESULT_FILTERS}
              value={result}
              onChange={setResult}
              aria-label="Lookup result"
            />
          </AdminFilterField>
          <AdminFilterField label="Window">
            <AdminFilterChips
              options={HOUR_OPTIONS}
              value={hours}
              onChange={setHours}
              aria-label="Look-back window"
            />
          </AdminFilterField>
          <AdminFilterField label="Scanner account">
            <form
              className="admin-v4-search"
              onSubmit={(event) => {
                event.preventDefault();
                if (!accountInvalid) setAccountId(accountDraft.trim());
              }}
            >
              <input
                className="admin-mono"
                aria-label="Scanner account id"
                placeholder="Account UUID"
                data-testid="plate-lookups-account"
                value={accountDraft}
                aria-invalid={accountInvalid || undefined}
                onChange={(event) => {
                  setAccountDraft(event.target.value);
                }}
              />
              <AlButton size="sm" variant="secondary" type="submit" disabled={accountInvalid}>
                Apply
              </AlButton>
              {accountId ? (
                <AlButton
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setAccountDraft('');
                    setAccountId('');
                  }}
                >
                  Clear
                </AlButton>
              ) : null}
            </form>
          </AdminFilterField>
        </>
      }
    >
      {lookups.error ? (
        <AlErrorState message={lookups.error} onRetry={lookups.refresh} />
      ) : (
        <div data-testid="plate-lookups">
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="plate-lookups-table"
            columns={columns}
            data={rows}
            loading={lookups.isLoading}
            isRefreshing={lookups.isFetching && !lookups.isLoading}
            enableGlobalSearch={false}
            emptyTitle="No lookups"
            emptyDescription="No plate lookups match these filters in this window."
            getRowId={(row) => row.id}
          />
          {rows.length >= LOOKUP_LIMIT ? (
            <p className="admin-empty-note">
              Showing the newest {String(LOOKUP_LIMIT)} lookups — narrow the window or filter by
              result / account to see older ones.
            </p>
          ) : null}
        </div>
      )}
    </AdminDataBlock>
  );
}

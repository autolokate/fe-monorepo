import type { ClawbackResultDto, SettlementBatchResultDto } from '@autolokate/api-client';
import {
  AlConfirmationDialog,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useState } from 'react';

import { ClawbackResultPanel, CreateClawbackSheet } from '@/features/finance/CreateClawbackSheet';
import { useFinanceMutations } from '@/hooks/finance/useFinanceMutations';
import { AdminPanel, AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import { useAdminAnyPermission, useAdminPermission } from '@/platform/rbac/useAdminPermission';

function SettlementResultPanel({ result }: { result: SettlementBatchResultDto }) {
  return (
    <AdminPanel title="Settlement batch result" subtitle="Counts from the batch you just ran.">
      <AdminKpiStrip
        items={[
          { label: 'Groups considered', value: result.groups.toLocaleString() },
          { label: 'Payouts created', value: result.payouts.toLocaleString() },
          { label: 'Skipped', value: result.skipped.toLocaleString() },
          { label: 'Errors', value: result.errors.toLocaleString() },
        ]}
      />
    </AdminPanel>
  );
}

export function FinanceOperationsPage() {
  const canAccess = useAdminAnyPermission(['clawbacks:write', 'settlements:write']);
  const canClawback = useAdminPermission('clawbacks:write');
  const canSettle = useAdminPermission('settlements:write');
  const { settlementMutation } = useFinanceMutations();

  const [clawbackOpen, setClawbackOpen] = useState(false);
  const [settlementConfirmOpen, setSettlementConfirmOpen] = useState(false);
  const [clawbackResult, setClawbackResult] = useState<ClawbackResultDto | null>(null);
  const [settlementResult, setSettlementResult] = useState<SettlementBatchResultDto | null>(null);

  if (!canAccess) {
    return (
      <AlErrorState
        title="Access denied"
        message="You do not have permission to run finance operations."
      />
    );
  }

  return (
    <AlStack gap="md">
      <AlPageHeader
        title="Settlements"
        description="Recover commissions and run partner payout batches."
        actions={
          <>
            {canClawback ? (
              <AlPageHeaderAction
                label="Create clawback"
                onClick={() => {
                  setClawbackOpen(true);
                }}
              />
            ) : null}
            {canSettle ? (
              <AlPageHeaderAction
                label="Run settlement"
                variant="secondary"
                loading={settlementMutation.isPending}
                onClick={() => {
                  setSettlementConfirmOpen(true);
                }}
              />
            ) : null}
          </>
        }
      />

      {!clawbackResult && !settlementResult ? (
        <AdminPanel
          title="Operations"
          subtitle="Clawbacks reverse a captured payment. Settlement groups earned commissions into payouts."
        >
          <p className="admin-empty-note">
            Results appear here after you create a clawback or run a settlement batch.
          </p>
        </AdminPanel>
      ) : (
        <>
          {clawbackResult ? <ClawbackResultPanel result={clawbackResult} /> : null}
          {settlementResult ? <SettlementResultPanel result={settlementResult} /> : null}
        </>
      )}

      <CreateClawbackSheet
        open={clawbackOpen}
        onOpenChange={setClawbackOpen}
        onCreated={setClawbackResult}
      />

      <AlConfirmationDialog
        open={settlementConfirmOpen}
        onOpenChange={setSettlementConfirmOpen}
        title="Run settlement batch"
        description="Group last month’s earned commissions into payouts ready for partners. Safe to re-run — already processed groups are skipped."
        confirmLabel="Run settlement"
        loading={settlementMutation.isPending}
        onConfirm={() => {
          void settlementMutation
            .mutateAsync(undefined)
            .then(setSettlementResult)
            .finally(() => {
              setSettlementConfirmOpen(false);
            });
        }}
      />
    </AlStack>
  );
}

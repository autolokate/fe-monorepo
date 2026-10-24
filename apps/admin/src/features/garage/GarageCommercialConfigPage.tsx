import type {
  GarageFreeBidsBalanceDto,
  GaragePassGrantResultDto,
  ProvisionGarageResultDto,
} from '@autolokate/api-client';
import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useEffect, useMemo, useState } from 'react';

import {
  AdjustFreeBidsSheet,
  FreeBidsBalancePanel,
  GrantPassSheet,
  PassGrantResultPanel,
  ProvisionGarageResultPanel,
  ProvisionGarageSheet,
} from '@/features/garage/GarageEntitlementSheets';
import { useGarageCommercialConfig } from '@/hooks/garage/useGarageCommercialConfig';
import { AdminDataBlock } from '@/platform/components/AdminDataBlock';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './garage-commercial-config.css';

function formatRupees(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

type FormState = {
  freeBidLifetimeCount: number;
  dayPassPriceRupees: number;
  monthPassPriceRupees: number;
  dayPassDurationHours: number;
  gstRateBps: number;
  welcomeCredits: number;
  creditsPerFirstBid: number;
};

export function GarageCommercialConfigPage() {
  const canWrite = useAdminPermission('settings:write');
  const {
    config,
    history,
    isLoading,
    isFetching,
    isHistoryLoading,
    historyErrorMessage,
    userErrorMessage,
    saveErrorMessage,
    isSaving,
    save,
    refresh,
  } = useGarageCommercialConfig();
  const [form, setForm] = useState<FormState | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [grantResult, setGrantResult] = useState<GaragePassGrantResultDto | null>(null);
  const [adjustResult, setAdjustResult] = useState<GarageFreeBidsBalanceDto | null>(null);
  const [provisionResult, setProvisionResult] = useState<ProvisionGarageResultDto | null>(null);

  useEffect(() => {
    if (!config) return;
    setForm({
      freeBidLifetimeCount: config.freeBidLifetimeCount,
      dayPassPriceRupees: config.dayPassPriceRupees,
      monthPassPriceRupees: config.monthPassPriceRupees,
      dayPassDurationHours: config.dayPassDurationHours,
      gstRateBps: config.gstRateBps,
      welcomeCredits: config.welcomeCredits,
      creditsPerFirstBid: config.creditsPerFirstBid,
    });
  }, [config]);

  const pageDescription = useMemo(() => {
    if (isLoading || !config) {
      return 'Garage commercial settings and org entitlement ops (pass grant / free-bid adjust / partner provision).';
    }
    return buildPageSummary([
      `${String(config.freeBidLifetimeCount)} lifetime free bids`,
      `day pass ${formatRupees(config.dayPassPriceRupees)}`,
      `month pass ${formatRupees(config.monthPassPriceRupees)}`,
    ]);
  }, [config, isLoading]);

  if (userErrorMessage && !config && !isLoading) {
    return (
      <RequirePermission permission="settings:read">
        <AlErrorState
          message={userErrorMessage}
          onRetry={() => {
            refresh();
          }}
        />
      </RequirePermission>
    );
  }

  const onSave = async () => {
    if (!form || !config || !canWrite || isSaving) return;
    setSavedNote(null);
    try {
      await save({
        welcomeCredits: form.welcomeCredits,
        creditsPerFirstBid: form.creditsPerFirstBid,
        freeBidLifetimeCount: form.freeBidLifetimeCount,
        dayPassPriceRupees: form.dayPassPriceRupees,
        monthPassPriceRupees: form.monthPassPriceRupees,
        dayPassDurationHours: form.dayPassDurationHours,
        monthPassDurationKind: config.monthPassDurationKind,
        gstRateBps: form.gstRateBps,
      });
      setSavedNote('Commercial configuration saved.');
    } catch {
      // Error surfaced via saveErrorMessage + toast.
    }
  };

  return (
    <RequirePermission permission="settings:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Garage commercial"
          description={pageDescription}
          actions={
            <>
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
              {canWrite ? (
                <>
                  <AlPageHeaderAction
                    label="Grant pass"
                    variant="secondary"
                    onClick={() => {
                      setGrantOpen(true);
                    }}
                  />
                  <AlPageHeaderAction
                    label="Adjust free bids"
                    variant="secondary"
                    onClick={() => {
                      setAdjustOpen(true);
                    }}
                  />
                  <AlPageHeaderAction
                    label="Provision partner"
                    variant="secondary"
                    onClick={() => {
                      setProvisionOpen(true);
                    }}
                  />
                  {form && !isLoading ? (
                    <AlPageHeaderAction
                      label={isSaving ? 'Saving…' : 'Save'}
                      loading={isSaving}
                      onClick={() => {
                        void onSave();
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </>
          }
        />

        <AdminDataBlock>
          {isLoading || !form ? (
            <p className="garage-commercial-config__muted">Loading commercial configuration…</p>
          ) : (
            <form
              className="garage-commercial-config__form"
              onSubmit={(event) => {
                event.preventDefault();
                void onSave();
              }}
            >
              <label>
                Lifetime free bids
                <input
                  data-testid="garage-free-bid-lifetime-count"
                  type="number"
                  min={0}
                  disabled={!canWrite}
                  value={form.freeBidLifetimeCount}
                  onChange={(e) => {
                    setForm({ ...form, freeBidLifetimeCount: Number(e.target.value) });
                  }}
                />
              </label>
              <label>
                Day pass price (₹)
                <input
                  data-testid="garage-day-pass-price"
                  type="number"
                  min={0}
                  disabled={!canWrite}
                  value={form.dayPassPriceRupees}
                  onChange={(e) => {
                    setForm({ ...form, dayPassPriceRupees: Number(e.target.value) });
                  }}
                />
              </label>
              <label>
                Day pass duration (hours)
                <input
                  type="number"
                  min={1}
                  disabled={!canWrite}
                  value={form.dayPassDurationHours}
                  onChange={(e) => {
                    setForm({ ...form, dayPassDurationHours: Number(e.target.value) });
                  }}
                />
              </label>
              <label>
                Month pass price (₹)
                <input
                  data-testid="garage-month-pass-price"
                  type="number"
                  min={0}
                  disabled={!canWrite}
                  value={form.monthPassPriceRupees}
                  onChange={(e) => {
                    setForm({ ...form, monthPassPriceRupees: Number(e.target.value) });
                  }}
                />
              </label>
              <label>
                GST rate (bps)
                <input
                  type="number"
                  min={0}
                  disabled={!canWrite}
                  value={form.gstRateBps}
                  onChange={(e) => {
                    setForm({ ...form, gstRateBps: Number(e.target.value) });
                  }}
                />
              </label>
              <p className="garage-commercial-config__muted">
                Month duration: {config?.monthPassDurationKind ?? 'CALENDAR_MONTH_IST'} (contract
                fixed)
              </p>
              <p className="garage-commercial-config__note">
                Pass grants and free-bid adjustments use dedicated admin org endpoints via
                `@autolokate/api-client` (`passes/grant`, `free-bids/adjust`). Success panels appear
                only after the server confirms. Garage passes are not `/v1/orders`. Legacy welcome
                credits / credits-per-bid remain audit-only ({form.welcomeCredits}/
                {form.creditsPerFirstBid}).
              </p>
              <p className="garage-commercial-config__note" data-testid="garage-contract-gap-note">
                Partner provision: POST /admin/v1/garage/provision (Provision partner). Legacy
                POST /admin/v1/garage/orgs/{'{orgId}'}/credits/adjust remains deferred (deprecated
                welcome-credits path; no invent).
              </p>
              {saveErrorMessage ? (
                <p className="garage-commercial-config__error" role="alert">
                  {saveErrorMessage}
                </p>
              ) : null}
              {savedNote ? (
                <p className="garage-commercial-config__ok" role="status">
                  {savedNote}
                </p>
              ) : null}
            </form>
          )}
        </AdminDataBlock>

        <h2 className="garage-commercial-config__section-title">Configuration history</h2>
        <AdminDataBlock>
          {historyErrorMessage ? (
            <p className="garage-commercial-config__error" role="alert" data-testid="garage-config-history-error">
              {historyErrorMessage}
            </p>
          ) : isHistoryLoading ? (
            <p className="garage-commercial-config__muted" data-testid="garage-config-history-loading">
              Loading configuration history…
            </p>
          ) : history.length === 0 ? (
            <p className="garage-commercial-config__muted" data-testid="garage-config-history-empty">
              No Garage commercial configuration changes yet.
            </p>
          ) : (
            <ul className="garage-commercial-config__history" data-testid="garage-config-history">
              {history.map((row) => (
                <li key={row.id} data-testid={`garage-config-history-row-${row.id}`}>
                  <strong>{row.createdAt}</strong>
                  {` · day ₹${String(row.after.dayPassPriceRupees)}`}
                  {` · month ₹${String(row.after.monthPassPriceRupees)}`}
                  {typeof row.after.freeBidLifetimeCount === 'number'
                    ? ` · free bids ${String(row.after.freeBidLifetimeCount)}`
                    : null}
                  {` · admin ${row.adminAccountId.slice(0, 8)}`}
                </li>
              ))}
            </ul>
          )}
        </AdminDataBlock>

        <div className="admin-operations-results">
          {grantResult ? <PassGrantResultPanel result={grantResult} /> : null}
          {adjustResult ? <FreeBidsBalancePanel result={adjustResult} /> : null}
          {provisionResult ? <ProvisionGarageResultPanel result={provisionResult} /> : null}
        </div>

        {!grantResult && !adjustResult && !provisionResult ? (
          <p className="admin-empty-note admin-operations-empty">
            Org pass grants, free-bid adjustments, and partner provision results appear here after a
            successful server response.
          </p>
        ) : null}

        <GrantPassSheet open={grantOpen} onOpenChange={setGrantOpen} onGranted={setGrantResult} />
        <AdjustFreeBidsSheet
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          onAdjusted={setAdjustResult}
        />
        <ProvisionGarageSheet
          open={provisionOpen}
          onOpenChange={setProvisionOpen}
          onProvisioned={setProvisionResult}
        />
      </AlStack>
    </RequirePermission>
  );
}

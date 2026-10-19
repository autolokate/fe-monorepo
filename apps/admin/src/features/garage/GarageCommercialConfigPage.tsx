import type { GarageFreeBidsBalanceDto, GaragePassGrantResultDto } from '@autolokate/api-client';
import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useEffect, useMemo, useState } from 'react';

import {
  AdjustFreeBidsSheet,
  FreeBidsBalancePanel,
  GrantPassSheet,
  PassGrantResultPanel,
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
    isLoading,
    isFetching,
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
  const [grantResult, setGrantResult] = useState<GaragePassGrantResultDto | null>(null);
  const [adjustResult, setAdjustResult] = useState<GarageFreeBidsBalanceDto | null>(null);

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
      return 'Garage commercial settings and org entitlement ops (pass grant / free-bid adjust).';
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
    if (!form || !config || !canWrite) return;
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
                OpenAPI also exposes POST /admin/v1/garage/orgs/{'{orgId}'}/credits/adjust and POST
                /admin/v1/garage/provision — not wired in Admin UI this batch (legacy credits /
                partner provision; no invent). Blocked until product scopes them.
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

        <div className="admin-operations-results">
          {grantResult ? <PassGrantResultPanel result={grantResult} /> : null}
          {adjustResult ? <FreeBidsBalancePanel result={adjustResult} /> : null}
        </div>

        {!grantResult && !adjustResult ? (
          <p className="admin-empty-note admin-operations-empty">
            Org pass grants and free-bid adjustments appear here after a successful server response.
          </p>
        ) : null}

        <GrantPassSheet open={grantOpen} onOpenChange={setGrantOpen} onGranted={setGrantResult} />
        <AdjustFreeBidsSheet
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          onAdjusted={setAdjustResult}
        />
      </AlStack>
    </RequirePermission>
  );
}

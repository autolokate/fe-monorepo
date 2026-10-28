import type {
  GarageFreeBidsBalanceDto,
  GaragePassGrantResultDto,
  ProvisionGarageResultDto,
} from '@autolokate/api-client';
import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import {
  AdjustFreeBidsSheet,
  FreeBidsBalancePanel,
  GrantPassSheet,
  PassGrantResultPanel,
  ProvisionGarageResultPanel,
  ProvisionGarageSheet,
} from '@/features/garage/GarageEntitlementSheets';
import { useGarageCommercialConfig } from '@/hooks/garage/useGarageCommercialConfig';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './garage-commercial-config.css';

type FormState = {
  freeBidLifetimeCount: number;
  dayPassPriceRupees: number;
  monthPassPriceRupees: number;
  dayPassDurationHours: number;
  gstRateBps: number;
  welcomeCredits: number;
  creditsPerFirstBid: number;
};

function formatRupees(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

function monthDurationLabel(kind: string | undefined): string {
  if (kind === 'CALENDAR_MONTH_IST' || !kind) return 'Calendar month (IST)';
  return kind
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatHistoryWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

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
          description="Pass pricing, free bids, and partner provisioning for Garage."
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

        {form && !isLoading ? (
          <div className="admin-kpi-strip" data-testid="garage-commercial-kpi">
            <div className="admin-kpi">
              <span className="admin-kpi__value">{form.freeBidLifetimeCount}</span>
              <span className="admin-kpi__label">Lifetime free bids</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi__value">{formatRupees(form.dayPassPriceRupees)}</span>
              <span className="admin-kpi__label">Day pass</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi__value">{formatRupees(form.monthPassPriceRupees)}</span>
              <span className="admin-kpi__label">Month pass</span>
            </div>
            <div className="admin-kpi">
              <span className="admin-kpi__value">{bpsToPercent(form.gstRateBps)}</span>
              <span className="admin-kpi__label">GST</span>
            </div>
          </div>
        ) : null}

        <section className="admin-panel" data-testid="garage-commercial-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Pricing & bids</h2>
              <p className="admin-panel__subtitle">
                Live commercial settings applied to Garage partner orgs.
              </p>
            </div>
          </div>

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
              <label className="admin-field">
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
              <label className="admin-field">
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
              <label className="admin-field">
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
              <label className="admin-field">
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
              <label className="admin-field">
                GST rate
                <input
                  type="number"
                  min={0}
                  disabled={!canWrite}
                  value={form.gstRateBps}
                  onChange={(e) => {
                    setForm({ ...form, gstRateBps: Number(e.target.value) });
                  }}
                />
                <span className="admin-field__hint">
                  {bpsToPercent(form.gstRateBps)} · 100 equals 1%
                </span>
              </label>
              <p className="garage-commercial-config__muted admin-form-span">
                Month duration: {monthDurationLabel(config?.monthPassDurationKind)}
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
        </section>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Configuration history</h2>
              <p className="admin-panel__subtitle">Recent saved commercial settings.</p>
            </div>
          </div>
          {historyErrorMessage ? (
            <p
              className="garage-commercial-config__error"
              role="alert"
              data-testid="garage-config-history-error"
            >
              {historyErrorMessage}
            </p>
          ) : isHistoryLoading ? (
            <p
              className="garage-commercial-config__muted"
              data-testid="garage-config-history-loading"
            >
              Loading configuration history…
            </p>
          ) : history.length === 0 ? (
            <p
              className="garage-commercial-config__muted"
              data-testid="garage-config-history-empty"
            >
              No configuration changes yet.
            </p>
          ) : (
            <ul className="admin-history-list" data-testid="garage-config-history">
              {history.map((row) => (
                <li key={row.id} data-testid={`garage-config-history-row-${row.id}`}>
                  <strong>{formatHistoryWhen(row.createdAt)}</strong>
                  <span className="admin-history-list__meta">
                    {`Day ${formatRupees(row.after.dayPassPriceRupees)} · Month ${formatRupees(row.after.monthPassPriceRupees)}`}
                    {typeof row.after.freeBidLifetimeCount === 'number'
                      ? ` · Free bids ${String(row.after.freeBidLifetimeCount)}`
                      : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-operations-results">
          {grantResult ? <PassGrantResultPanel result={grantResult} /> : null}
          {adjustResult ? <FreeBidsBalancePanel result={adjustResult} /> : null}
          {provisionResult ? <ProvisionGarageResultPanel result={provisionResult} /> : null}
        </div>

        {!grantResult && !adjustResult && !provisionResult ? (
          <p className="admin-empty-note admin-operations-empty">
            Pass grants, free-bid adjustments, and partner provision results appear here after
            success.
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

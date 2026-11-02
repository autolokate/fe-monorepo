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
import {
  configToForm,
  formatIstDateTime,
  monthPassDurationLabel,
  nextIstWeeklyReset,
  supportsFlowV3Garage,
  toUpdateGarageCommercialConfigBody,
  validateGarageCommercialForm,
  type GarageCommercialFormErrors,
  type GarageCommercialFormField,
  type GarageCommercialFormState,
} from '@/features/garage/garage-commercial-form';
import { useGarageCommercialConfig } from '@/hooks/garage/useGarageCommercialConfig';
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

function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
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
  const [form, setForm] = useState<GarageCommercialFormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<GarageCommercialFormErrors>({});
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [grantResult, setGrantResult] = useState<GaragePassGrantResultDto | null>(null);
  const [adjustResult, setAdjustResult] = useState<GarageFreeBidsBalanceDto | null>(null);
  const [provisionResult, setProvisionResult] = useState<ProvisionGarageResultDto | null>(null);

  const flowV3 = supportsFlowV3Garage(config);
  const nextReset = useMemo(() => formatIstDateTime(nextIstWeeklyReset(new Date())), []);

  useEffect(() => {
    if (!config) return;
    setForm(configToForm(config));
    setFieldErrors({});
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

  const updateField = <K extends GarageCommercialFormField>(
    field: K,
    value: GarageCommercialFormState[K],
  ) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
    setSavedNote(null);
    if (fieldErrors[field]) {
      setFieldErrors(
        Object.fromEntries(Object.entries(fieldErrors).filter(([key]) => key !== field)),
      );
    }
  };

  const fieldError = (field: GarageCommercialFormField, testId: string) =>
    fieldErrors[field] ? (
      <span className="admin-form-error" role="alert" data-testid={`${testId}-error`}>
        {fieldErrors[field]}
      </span>
    ) : null;

  const onSave = async () => {
    if (!form || !config || !canWrite || isSaving) return;
    setSavedNote(null);
    const errors = validateGarageCommercialForm(form, { flowV3 });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await save(toUpdateGarageCommercialConfigBody(config, form, { flowV3 }));
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
          description="Weekly free bids, pass pricing, and partner provisioning for Garage."
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
                    label={flowV3 ? 'Weekly free-bid bonus' : 'Adjust free bids'}
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
            {flowV3 && config ? (
              <div className="admin-kpi" data-testid="garage-kpi-free-bids-per-week">
                <span className="admin-kpi__value">{config.freeBidsPerWeek}</span>
                <span className="admin-kpi__label">Free bids / week</span>
              </div>
            ) : config ? (
              <div className="admin-kpi">
                <span className="admin-kpi__value">{config.freeBidLifetimeCount}</span>
                <span className="admin-kpi__label">Lifetime free bids</span>
              </div>
            ) : null}
            {config ? (
              <>
                <div className="admin-kpi">
                  <span className="admin-kpi__value">
                    {formatRupees(config.dayPassPriceRupees)}
                  </span>
                  <span className="admin-kpi__label">
                    Day pass · {config.dayPassDurationHours} h
                  </span>
                </div>
                <div className="admin-kpi" data-testid="garage-kpi-month-pass">
                  <span className="admin-kpi__value">
                    {formatRupees(config.monthPassPriceRupees)}
                  </span>
                  <span className="admin-kpi__label">
                    Month pass ·{' '}
                    {monthPassDurationLabel(
                      config.monthPassDurationKind,
                      config.monthPassDurationDays,
                    )}
                  </span>
                </div>
                <div className="admin-kpi">
                  <span className="admin-kpi__value">{bpsToPercent(config.gstRateBps)}</span>
                  <span className="admin-kpi__label">GST</span>
                </div>
              </>
            ) : null}
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
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void onSave();
              }}
            >
              <fieldset
                className="garage-commercial-config__group"
                data-testid="garage-free-bids-group"
              >
                <legend className="garage-commercial-config__legend">Free bids</legend>
                {flowV3 ? (
                  <>
                    <label className="admin-field">
                      Free bids per week
                      <input
                        data-testid="garage-free-bids-per-week"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        step={1}
                        disabled={!canWrite}
                        aria-invalid={Boolean(fieldErrors.freeBidsPerWeek)}
                        value={form.freeBidsPerWeek}
                        onChange={(e) => {
                          updateField('freeBidsPerWeek', e.target.value);
                        }}
                      />
                      <span className="admin-field__hint">
                        0–100 per garage business, shared by all staff. Resets every Monday 00:00
                        IST.
                      </span>
                      {fieldError('freeBidsPerWeek', 'garage-free-bids-per-week')}
                    </label>
                    <div
                      className="garage-commercial-config__fact"
                      data-testid="garage-free-bids-next-reset"
                    >
                      <span className="garage-commercial-config__fact-label">Next reset</span>
                      <span className="garage-commercial-config__fact-value">{nextReset}</span>
                      <span className="admin-field__hint">
                        Lifetime grant {config?.freeBidLifetimeCount ?? '—'} is kept for history
                        only and no longer gates bidding.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="admin-field">
                      Lifetime free bids
                      <input
                        data-testid="garage-free-bid-lifetime-count"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        disabled={!canWrite}
                        aria-invalid={Boolean(fieldErrors.freeBidLifetimeCount)}
                        value={form.freeBidLifetimeCount}
                        onChange={(e) => {
                          updateField('freeBidLifetimeCount', e.target.value);
                        }}
                      />
                      {fieldError('freeBidLifetimeCount', 'garage-free-bid-lifetime-count')}
                    </label>
                    <p
                      className="garage-commercial-config__muted"
                      data-testid="garage-weekly-free-bids-unavailable"
                    >
                      Weekly free bids (reset Monday 00:00 IST) appear here once the API serves the
                      flow v3 commercial config.
                    </p>
                  </>
                )}
              </fieldset>

              <fieldset className="garage-commercial-config__group">
                <legend className="garage-commercial-config__legend">24-hour pass</legend>
                <label className="admin-field">
                  Day pass price (₹)
                  <input
                    data-testid="garage-day-pass-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    disabled={!canWrite}
                    aria-invalid={Boolean(fieldErrors.dayPassPriceRupees)}
                    value={form.dayPassPriceRupees}
                    onChange={(e) => {
                      updateField('dayPassPriceRupees', e.target.value);
                    }}
                  />
                  <span className="admin-field__hint">Whole rupees, GST included.</span>
                  {fieldError('dayPassPriceRupees', 'garage-day-pass-price')}
                </label>
                <label className="admin-field">
                  Day pass duration (hours)
                  <input
                    data-testid="garage-day-pass-hours"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={168}
                    step={1}
                    disabled={!canWrite}
                    aria-invalid={Boolean(fieldErrors.dayPassDurationHours)}
                    value={form.dayPassDurationHours}
                    onChange={(e) => {
                      updateField('dayPassDurationHours', e.target.value);
                    }}
                  />
                  {fieldError('dayPassDurationHours', 'garage-day-pass-hours')}
                </label>
              </fieldset>

              <fieldset className="garage-commercial-config__group">
                <legend className="garage-commercial-config__legend">Monthly pass</legend>
                <label className="admin-field">
                  Month pass price (₹)
                  <input
                    data-testid="garage-month-pass-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    disabled={!canWrite}
                    aria-invalid={Boolean(fieldErrors.monthPassPriceRupees)}
                    value={form.monthPassPriceRupees}
                    onChange={(e) => {
                      updateField('monthPassPriceRupees', e.target.value);
                    }}
                  />
                  <span className="admin-field__hint">Whole rupees, GST included.</span>
                  {fieldError('monthPassPriceRupees', 'garage-month-pass-price')}
                </label>
                <label className="admin-field">
                  Month pass duration
                  <select
                    data-testid="garage-month-pass-duration-kind"
                    disabled={!canWrite || !flowV3}
                    value={form.monthPassDurationKind}
                    onChange={(e) => {
                      updateField(
                        'monthPassDurationKind',
                        e.target.value === 'ROLLING_DAYS' ? 'ROLLING_DAYS' : 'CALENDAR_MONTH_IST',
                      );
                    }}
                  >
                    <option value="CALENDAR_MONTH_IST">Calendar month (IST)</option>
                    {flowV3 ? <option value="ROLLING_DAYS">Fixed number of days</option> : null}
                  </select>
                  <span className="admin-field__hint">
                    {form.monthPassDurationKind === 'ROLLING_DAYS'
                      ? 'The pass runs for the set number of days from purchase.'
                      : 'The pass runs until the same date next month (IST).'}
                  </span>
                  {fieldError('monthPassDurationKind', 'garage-month-pass-duration-kind')}
                </label>
                {flowV3 && form.monthPassDurationKind === 'ROLLING_DAYS' ? (
                  <label className="admin-field">
                    Month pass length (days)
                    <input
                      data-testid="garage-month-pass-duration-days"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={366}
                      step={1}
                      disabled={!canWrite}
                      aria-invalid={Boolean(fieldErrors.monthPassDurationDays)}
                      value={form.monthPassDurationDays}
                      onChange={(e) => {
                        updateField('monthPassDurationDays', e.target.value);
                      }}
                    />
                    <span className="admin-field__hint">1–366 days.</span>
                    {fieldError('monthPassDurationDays', 'garage-month-pass-duration-days')}
                  </label>
                ) : null}
              </fieldset>

              <fieldset className="garage-commercial-config__group">
                <legend className="garage-commercial-config__legend">Tax</legend>
                <label className="admin-field">
                  GST rate (basis points)
                  <input
                    data-testid="garage-gst-rate-bps"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    disabled={!canWrite}
                    aria-invalid={Boolean(fieldErrors.gstRateBps)}
                    value={form.gstRateBps}
                    onChange={(e) => {
                      updateField('gstRateBps', e.target.value);
                    }}
                  />
                  <span className="admin-field__hint">
                    {/^\d+$/.test(form.gstRateBps) ? bpsToPercent(Number(form.gstRateBps)) : '—'} ·
                    100 equals 1%
                  </span>
                  {fieldError('gstRateBps', 'garage-gst-rate-bps')}
                </label>
              </fieldset>

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
                    {typeof row.after.freeBidsPerWeek === 'number'
                      ? ` · Free bids ${String(row.after.freeBidsPerWeek)}/week`
                      : typeof row.after.freeBidLifetimeCount === 'number'
                        ? ` · Free bids ${String(row.after.freeBidLifetimeCount)}`
                        : null}
                    {row.after.monthPassDurationKind === 'ROLLING_DAYS'
                      ? ` · Month ${monthPassDurationLabel('ROLLING_DAYS', row.after.monthPassDurationDays)}`
                      : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-operations-results">
          {grantResult ? <PassGrantResultPanel result={grantResult} /> : null}
          {adjustResult ? <FreeBidsBalancePanel result={adjustResult} weekly={flowV3} /> : null}
          {provisionResult ? <ProvisionGarageResultPanel result={provisionResult} /> : null}
        </div>

        {!grantResult && !adjustResult && !provisionResult ? (
          <p className="admin-empty-note admin-operations-empty">
            Pass grants, free-bid {flowV3 ? 'bonuses' : 'adjustments'}, and partner provision
            results appear here after success.
          </p>
        ) : null}

        <GrantPassSheet open={grantOpen} onOpenChange={setGrantOpen} onGranted={setGrantResult} />
        <AdjustFreeBidsSheet
          weekly={flowV3}
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

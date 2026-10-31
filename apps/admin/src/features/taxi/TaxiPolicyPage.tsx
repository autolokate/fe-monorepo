import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useEffect, useMemo, useState } from 'react';

import { TaxiProvisionSheet } from '@/features/taxi/TaxiProvisionSheet';
import { useTaxiPolicy } from '@/hooks/taxi/useTaxiPolicy';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './taxi-policy.css';

/** Admin-supplied bps only — never invent runtime rates. Operator tip: 500 = 5% advance, 700 = 7% deposit. */
const BPS_MIN = 0;
const BPS_MAX = 10_000;

type FormState = {
  customerAdvanceBps: number;
  partnerDepositBps: number;
};

type FieldErrors = {
  customerAdvanceBps?: string;
  partnerDepositBps?: string;
};

function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

function statusChipClass(status: string | undefined): string {
  if (status === 'PUBLISHED') return 'admin-status-chip admin-status-chip--published';
  if (status === 'DRAFT') return 'admin-status-chip admin-status-chip--draft';
  return 'admin-status-chip admin-status-chip--none';
}

function parseBpsInput(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '') return 0;
  return Number.parseInt(trimmed, 10);
}

function validateBps(value: number, label: string): string | undefined {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return `${label} must be a whole number.`;
  }
  if (value < BPS_MIN || value > BPS_MAX) {
    return `${label} must be between ${String(BPS_MIN)} and ${String(BPS_MAX)} (100 = 1%).`;
  }
  return undefined;
}

function validateForm(form: FormState): FieldErrors {
  return {
    customerAdvanceBps: validateBps(form.customerAdvanceBps, 'Customer advance'),
    partnerDepositBps: validateBps(form.partnerDepositBps, 'Partner deposit'),
  };
}

export function TaxiPolicyPage() {
  const canWrite = useAdminPermission('settings:write');
  const {
    policy,
    history,
    isLoading,
    isFetching,
    isUnavailable,
    userErrorMessage,
    saveErrorMessage,
    publishErrorMessage,
    isSaving,
    isPublishing,
    save,
    publish,
    refresh,
  } = useTaxiPolicy();

  const [form, setForm] = useState<FormState | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [publishedNote, setPublishedNote] = useState<string | null>(null);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!policy) {
      if (isUnavailable) {
        setForm({ customerAdvanceBps: 0, partnerDepositBps: 0 });
      }
      return;
    }
    setForm({
      customerAdvanceBps:
        typeof policy.customerAdvanceBps === 'number' ? policy.customerAdvanceBps : 0,
      partnerDepositBps:
        typeof policy.partnerDepositBps === 'number' ? policy.partnerDepositBps : 0,
    });
    setShowValidation(false);
  }, [isUnavailable, policy]);

  const fieldErrors = useMemo(() => (form ? validateForm(form) : {}), [form]);
  const formInvalid = Boolean(fieldErrors.customerAdvanceBps || fieldErrors.partnerDepositBps);

  const pageDescription = isUnavailable
    ? 'No live policy yet. Enter advance and deposit bps (e.g. 500 = 5%, 700 = 7%), save a draft, then publish.'
    : 'Customer advance and partner deposit rates for Taxi. Save a draft, then publish. Rates are Admin-supplied (e.g. 500 = 5%, 700 = 7%).';

  const onSave = async () => {
    if (!form || !canWrite) return;
    setShowValidation(true);
    if (formInvalid) return;
    setSavedNote(null);
    setPublishedNote(null);
    try {
      await save({
        customerAdvanceBps: form.customerAdvanceBps,
        partnerDepositBps: form.partnerDepositBps,
      });
      setSavedNote('Draft saved.');
    } catch {
      // Error surfaced via saveErrorMessage + toast.
    }
  };

  const onPublish = async () => {
    if (!canWrite || !policy || policy.status !== 'DRAFT') return;
    setSavedNote(null);
    setPublishedNote(null);
    try {
      await publish();
      setPublishedNote('Policy published. Live money paths now use these rates.');
    } catch {
      // Error surfaced via publishErrorMessage + toast.
    }
  };

  if (userErrorMessage && !policy && !isLoading && !isUnavailable) {
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

  const statusLabel = policy?.status ?? (isUnavailable ? 'None' : '…');
  const publishedAdvance =
    policy?.status === 'PUBLISHED' && typeof policy.customerAdvanceBps === 'number'
      ? policy.customerAdvanceBps
      : null;
  const publishedDeposit =
    policy?.status === 'PUBLISHED' && typeof policy.partnerDepositBps === 'number'
      ? policy.partnerDepositBps
      : null;
  const busy = isSaving || isPublishing;

  return (
    <RequirePermission permission="settings:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi policy"
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
                    label="Provision Taxi"
                    variant="secondary"
                    onClick={() => {
                      setProvisionOpen(true);
                    }}
                  />
                  {form && !isLoading ? (
                    <AlPageHeaderAction
                      label={isSaving ? 'Saving…' : 'Save draft'}
                      loading={isSaving}
                      onClick={() => {
                        void onSave();
                      }}
                    />
                  ) : null}
                  {policy?.status === 'DRAFT' ? (
                    <AlPageHeaderAction
                      label={isPublishing ? 'Publishing…' : 'Publish'}
                      loading={isPublishing}
                      onClick={() => {
                        void onPublish();
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </>
          }
        />

        {publishedAdvance !== null && publishedDeposit !== null ? (
          <section
            className="admin-panel taxi-policy__published"
            data-testid="taxi-policy-published"
          >
            <div className="admin-panel__header">
              <div>
                <h2 className="admin-panel__title">Published (live)</h2>
                <p className="admin-panel__subtitle">
                  Money paths use these rates until a new draft is published.
                </p>
              </div>
              <div className="admin-panel__meta">
                <span className={statusChipClass('PUBLISHED')}>PUBLISHED</span>
              </div>
            </div>
            <dl className="taxi-policy__published-grid">
              <div>
                <dt>Customer advance</dt>
                <dd data-testid="taxi-policy-published-advance">
                  {publishedAdvance} bps · {bpsToPercent(publishedAdvance)}
                </dd>
              </div>
              <div>
                <dt>Partner deposit</dt>
                <dd data-testid="taxi-policy-published-deposit">
                  {publishedDeposit} bps · {bpsToPercent(publishedDeposit)}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        <section className="admin-panel" data-testid="taxi-policy-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">
                {policy?.status === 'PUBLISHED' ? 'Edit draft rates' : 'Current rates'}
              </h2>
              <p className="admin-panel__subtitle">
                Whole numbers — 100 = 1%. Tip: advance 500 (5%), deposit 700 (7%).
              </p>
            </div>
            <div className="admin-panel__meta">
              <span className={statusChipClass(policy?.status)} data-testid="taxi-policy-status">
                {statusLabel}
              </span>
            </div>
          </div>

          {isLoading && !form ? (
            <p className="taxi-policy__muted" data-testid="taxi-policy-loading">
              Loading Taxi policy…
            </p>
          ) : form ? (
            <form
              className="taxi-policy__form"
              onSubmit={(event) => {
                event.preventDefault();
                void onSave();
              }}
            >
              <label className="admin-field">
                Customer advance
                <input
                  data-testid="taxi-customer-advance-bps"
                  type="number"
                  min={BPS_MIN}
                  max={BPS_MAX}
                  step={1}
                  inputMode="numeric"
                  placeholder="500"
                  aria-invalid={showValidation && Boolean(fieldErrors.customerAdvanceBps)}
                  value={form.customerAdvanceBps}
                  disabled={!canWrite || busy}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      customerAdvanceBps: parseBpsInput(event.target.value),
                    });
                  }}
                />
                <span className="taxi-policy__pct admin-field__hint">
                  {Number.isFinite(form.customerAdvanceBps)
                    ? `${bpsToPercent(form.customerAdvanceBps)} of fare held as advance`
                    : 'Enter whole bps (e.g. 500 = 5%)'}
                </span>
                {showValidation && fieldErrors.customerAdvanceBps ? (
                  <span className="taxi-policy__field-error" role="alert">
                    {fieldErrors.customerAdvanceBps}
                  </span>
                ) : null}
              </label>
              <label className="admin-field">
                Partner deposit
                <input
                  data-testid="taxi-partner-deposit-bps"
                  type="number"
                  min={BPS_MIN}
                  max={BPS_MAX}
                  step={1}
                  inputMode="numeric"
                  placeholder="700"
                  aria-invalid={showValidation && Boolean(fieldErrors.partnerDepositBps)}
                  value={form.partnerDepositBps}
                  disabled={!canWrite || busy}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      partnerDepositBps: parseBpsInput(event.target.value),
                    });
                  }}
                />
                <span className="taxi-policy__pct admin-field__hint">
                  {Number.isFinite(form.partnerDepositBps)
                    ? `${bpsToPercent(form.partnerDepositBps)} partner deposit rate`
                    : 'Enter whole bps (e.g. 700 = 7%)'}
                </span>
                {showValidation && fieldErrors.partnerDepositBps ? (
                  <span className="taxi-policy__field-error" role="alert">
                    {fieldErrors.partnerDepositBps}
                  </span>
                ) : null}
              </label>
              {saveErrorMessage ? (
                <p className="taxi-policy__error" role="alert" data-testid="taxi-policy-save-error">
                  {saveErrorMessage}
                </p>
              ) : null}
              {publishErrorMessage ? (
                <p
                  className="taxi-policy__error"
                  role="alert"
                  data-testid="taxi-policy-publish-error"
                >
                  {publishErrorMessage}
                </p>
              ) : null}
              {savedNote ? (
                <p className="taxi-policy__ok" role="status" data-testid="taxi-policy-save-ok">
                  {savedNote}
                </p>
              ) : null}
              {publishedNote ? (
                <p className="taxi-policy__ok" role="status" data-testid="taxi-policy-publish-ok">
                  {publishedNote}
                </p>
              ) : null}
            </form>
          ) : null}
        </section>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Published history</h2>
              <p className="admin-panel__subtitle">Previous published versions of this policy.</p>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="taxi-policy__muted" data-testid="taxi-policy-history-empty">
              No published versions yet.
            </p>
          ) : (
            <ul className="admin-history-list" data-testid="taxi-policy-history">
              {history.map((row) => (
                <li key={row.id}>
                  <strong>{row.status ?? 'Published'}</strong>
                  <span className="admin-history-list__meta">
                    {typeof row.customerAdvanceBps === 'number'
                      ? `Advance ${bpsToPercent(row.customerAdvanceBps)}`
                      : null}
                    {typeof row.partnerDepositBps === 'number'
                      ? ` · Deposit ${bpsToPercent(row.partnerDepositBps)}`
                      : null}
                    {row.publishedAt ? ` · ${row.publishedAt}` : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <TaxiProvisionSheet open={provisionOpen} onOpenChange={setProvisionOpen} />
      </AlStack>
    </RequirePermission>
  );
}

import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import { TaxiProvisionSheet } from '@/features/taxi/TaxiProvisionSheet';
import { useTaxiPolicy } from '@/hooks/taxi/useTaxiPolicy';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './taxi-policy.css';

type FormState = {
  customerAdvanceBps: number;
  partnerDepositBps: number;
};

function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

function statusChipClass(status: string | undefined): string {
  if (status === 'PUBLISHED') return 'admin-status-chip admin-status-chip--published';
  if (status === 'DRAFT') return 'admin-status-chip admin-status-chip--draft';
  return 'admin-status-chip admin-status-chip--none';
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
  }, [isUnavailable, policy]);

  const pageDescription = isUnavailable
    ? 'Set customer advance and partner deposit rates, then publish when ready.'
    : 'Customer advance and partner deposit rates for Taxi. Save a draft, then publish.';

  const onSave = async () => {
    if (!form || !canWrite) return;
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
      setPublishedNote('Policy published.');
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

        <section className="admin-panel" data-testid="taxi-policy-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Current rates</h2>
              <p className="admin-panel__subtitle">Values are stored as basis points (100 = 1%).</p>
            </div>
            <div className="admin-panel__meta">
              <span className={statusChipClass(policy?.status)} data-testid="taxi-policy-status">
                {statusLabel}
              </span>
            </div>
          </div>

          {isLoading && !form ? (
            <p className="taxi-policy__muted">Loading Taxi policy…</p>
          ) : form ? (
            <form
              className="taxi-policy__form"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <label className="admin-field">
                Customer advance
                <input
                  data-testid="taxi-customer-advance-bps"
                  type="number"
                  min={0}
                  max={10_000}
                  step={1}
                  value={form.customerAdvanceBps}
                  disabled={!canWrite || isSaving || isPublishing}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      customerAdvanceBps: Number.parseInt(event.target.value || '0', 10) || 0,
                    });
                  }}
                />
                <span className="taxi-policy__pct admin-field__hint">
                  {bpsToPercent(form.customerAdvanceBps)} of fare held as advance
                </span>
              </label>
              <label className="admin-field">
                Partner deposit
                <input
                  data-testid="taxi-partner-deposit-bps"
                  type="number"
                  min={0}
                  max={10_000}
                  step={1}
                  value={form.partnerDepositBps}
                  disabled={!canWrite || isSaving || isPublishing}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      partnerDepositBps: Number.parseInt(event.target.value || '0', 10) || 0,
                    });
                  }}
                />
                <span className="taxi-policy__pct admin-field__hint">
                  {bpsToPercent(form.partnerDepositBps)} partner deposit rate
                </span>
              </label>
              {saveErrorMessage ? (
                <p className="taxi-policy__error" role="alert">
                  {saveErrorMessage}
                </p>
              ) : null}
              {publishErrorMessage ? (
                <p className="taxi-policy__error" role="alert">
                  {publishErrorMessage}
                </p>
              ) : null}
              {savedNote ? (
                <p className="taxi-policy__ok" role="status">
                  {savedNote}
                </p>
              ) : null}
              {publishedNote ? (
                <p className="taxi-policy__ok" role="status">
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

import type { TaxiPolicyDto } from '@autolokate/api-client';
import {
  AlButton,
  AlErrorState,
  AlModal,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useEffect, useMemo, useState } from 'react';

import {
  TAXI_POLICY_DISPLAY_ROWS,
  bodyFromForm,
  bpsToPercent,
  diffPolicies,
  formFromPolicy,
  formsEqual,
  hasFormErrors,
  validateTaxiPolicyForm,
  type TaxiPolicyFormField,
  type TaxiPolicyFormState,
} from '@/features/taxi/taxi-policy-form';
import { useTaxiPolicy } from '@/hooks/taxi/useTaxiPolicy';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './taxi-policy.css';

function statusChipClass(status: string | undefined): string {
  if (status === 'PUBLISHED') return 'admin-status-chip admin-status-chip--published';
  if (status === 'DRAFT') return 'admin-status-chip admin-status-chip--draft';
  return 'admin-status-chip admin-status-chip--none';
}

type NumberInputProps = {
  field: TaxiPolicyFormField;
  label: string;
  hint: string;
  form: TaxiPolicyFormState;
  error: string | undefined;
  showError: boolean;
  disabled: boolean;
  onChange: (field: TaxiPolicyFormField, value: string) => void;
  testId?: string;
  placeholder?: string;
};

function PolicyNumberInput({
  field,
  label,
  hint,
  form,
  error,
  showError,
  disabled,
  onChange,
  testId,
  placeholder,
}: NumberInputProps) {
  return (
    <label className="admin-field">
      {label}
      <input
        data-testid={testId}
        type="number"
        step={1}
        inputMode="numeric"
        placeholder={placeholder ?? 'Not set'}
        aria-invalid={showError && Boolean(error)}
        value={form[field]}
        disabled={disabled}
        onChange={(event) => {
          onChange(field, event.target.value);
        }}
      />
      <span className="taxi-policy__pct admin-field__hint">{hint}</span>
      {showError && error ? (
        <span className="taxi-policy__field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function bpsHint(raw: string, suffix: string, fallback: string): string {
  const value = Number.parseInt(raw, 10);
  return raw.trim() !== '' && Number.isFinite(value)
    ? `${bpsToPercent(value)} ${suffix}`
    : fallback;
}

function LivePolicyPanel({ live }: { live: TaxiPolicyDto | null }) {
  return (
    <section className="admin-panel taxi-policy__published" data-testid="taxi-policy-published">
      <div className="admin-panel__header">
        <div>
          <h2 className="admin-panel__title">Live (published)</h2>
          <p className="admin-panel__subtitle">
            {live
              ? `What money paths use right now${
                  live.publishedAt ? ` · published ${formatAdminDateTime(live.publishedAt)}` : ''
                }.`
              : 'Nothing published yet — taxi advance checkout fails closed until a policy is published.'}
          </p>
        </div>
        <div className="admin-panel__meta">
          <span className={statusChipClass(live ? 'PUBLISHED' : undefined)}>
            {live ? 'PUBLISHED' : 'NONE'}
          </span>
        </div>
      </div>
      {live ? (
        <dl className="taxi-policy__live-list">
          {TAXI_POLICY_DISPLAY_ROWS.map((row) => (
            <div key={row.key}>
              <dt>{row.label}</dt>
              <dd
                data-testid={
                  row.key === 'customerAdvanceBps'
                    ? 'taxi-policy-published-advance'
                    : row.key === 'partnerDepositBps'
                      ? 'taxi-policy-published-deposit'
                      : undefined
                }
              >
                {row.format(live)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
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
    historyErrorMessage,
    saveErrorMessage,
    publishErrorMessage,
    isSaving,
    isPublishing,
    save,
    publish,
    refresh,
  } = useTaxiPolicy();

  const draft = policy?.status === 'DRAFT' ? policy : null;
  // GET returns the DRAFT when one exists, so the live policy comes from history[0] in that case.
  const live: TaxiPolicyDto | null = policy?.status === 'PUBLISHED' ? policy : (history[0] ?? null);
  // Seed the editor from the draft, else the live policy, so a save never drops unseen fields.
  const baseline = useMemo(() => formFromPolicy(draft ?? live), [draft, live]);

  const [form, setForm] = useState<TaxiPolicyFormState | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [publishedNote, setPublishedNote] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!policy && !isUnavailable) return;
    setForm(baseline);
    setShowValidation(false);
  }, [baseline, isUnavailable, policy]);

  const errors = useMemo(() => (form ? validateTaxiPolicyForm(form) : {}), [form]);
  const formInvalid = hasFormErrors(errors);
  const dirty = form ? !formsEqual(form, baseline) : false;
  const diff = useMemo(() => diffPolicies(live, draft), [draft, live]);
  const busy = isSaving || isPublishing;

  const setField = (field: TaxiPolicyFormField, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setSavedNote(null);
    setPublishedNote(null);
  };

  const onSave = async () => {
    if (!form || !canWrite) return;
    setShowValidation(true);
    if (formInvalid) return;
    setSavedNote(null);
    setPublishedNote(null);
    try {
      await save(bodyFromForm(form));
      setSavedNote('Draft saved.');
    } catch {
      // Surfaced via saveErrorMessage + toast.
    }
  };

  const onConfirmPublish = async () => {
    if (!canWrite || !draft) return;
    setSavedNote(null);
    setPublishedNote(null);
    try {
      await publish();
      setConfirmOpen(false);
      setPublishedNote('Policy published. Live money paths now use these rates.');
    } catch {
      // Surfaced via publishErrorMessage + toast.
    }
  };

  if (userErrorMessage && !policy && !isLoading && !isUnavailable) {
    return (
      <RequirePermission permission="settings:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  const statusLabel = policy?.status ?? (isUnavailable ? 'None' : '…');
  const disabled = !canWrite || busy;
  const show = (field: TaxiPolicyFormField) => (showValidation ? errors[field] : undefined);

  return (
    <RequirePermission permission="settings:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi policy"
          description="Advance, deposit, no-show, deposit-release and cancellation rules for Taxi. Edit a draft, review the diff against the live policy, then publish."
          actions={
            <>
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
              {canWrite && form && !isLoading ? (
                <AlPageHeaderAction
                  label={isSaving ? 'Saving…' : 'Save draft'}
                  loading={isSaving}
                  variant={draft && !dirty ? 'secondary' : 'primary'}
                  onClick={() => {
                    void onSave();
                  }}
                />
              ) : null}
              {canWrite && draft ? (
                <AlPageHeaderAction
                  label="Publish"
                  disabled={dirty || busy}
                  onClick={() => {
                    setConfirmOpen(true);
                  }}
                />
              ) : null}
            </>
          }
        />

        {draft && dirty ? (
          <AlText tone="muted" variant="caption" data-testid="taxi-policy-unsaved">
            Unsaved changes — save the draft before publishing.
          </AlText>
        ) : null}

        <div className="taxi-policy__columns">
          <LivePolicyPanel live={live} />

          <section className="admin-panel" data-testid="taxi-policy-panel">
            <div className="admin-panel__header">
              <div>
                <h2 className="admin-panel__title">Draft</h2>
                <p className="admin-panel__subtitle">
                  {draft
                    ? 'Pending changes — not live until published.'
                    : live
                      ? 'No draft. Saving creates one from these values.'
                      : 'Enter the first policy. 100 bps = 1%.'}
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
                <h3 className="taxi-policy__group">Money (basis points, 100 = 1%)</h3>
                <PolicyNumberInput
                  field="customerAdvanceBps"
                  label="Customer advance"
                  testId="taxi-customer-advance-bps"
                  placeholder="500"
                  hint={bpsHint(
                    form.customerAdvanceBps,
                    'of fare — booking fee paid by the customer to Autolokate (0 = no fee)',
                    'Required, 0–10000',
                  )}
                  form={form}
                  error={show('customerAdvanceBps')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="partnerDepositBps"
                  label="Partner deposit"
                  testId="taxi-partner-deposit-bps"
                  placeholder="700"
                  hint={bpsHint(
                    form.partnerDepositBps,
                    'of fare — security deposit the partner pays before the trip (0 = none)',
                    'Required, 0–10000',
                  )}
                  form={form}
                  error={show('partnerDepositBps')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />

                <h3 className="taxi-policy__group">Money windows</h3>
                <PolicyNumberInput
                  field="customerAdvanceRefundWindowHours"
                  label="Booking-fee refund window (hours)"
                  testId="taxi-advance-refund-window-hours"
                  placeholder="24"
                  hint="0–720 (blank = server default). A customer who cancels within this many hours of paying gets the booking fee back in full; after it the fee is non-refundable."
                  form={form}
                  error={show('customerAdvanceRefundWindowHours')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="partnerDepositDueMinutes"
                  label="Partner deposit due (minutes)"
                  testId="taxi-deposit-due-minutes"
                  placeholder="120"
                  hint="1–10080 (blank = server default). The partner must pay the deposit within this many minutes of the booking fee (and before pickup), or the booking is cancelled and the customer refunded."
                  form={form}
                  error={show('partnerDepositDueMinutes')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="tripDisputeWindowHours"
                  label="Trip dispute window (hours)"
                  testId="taxi-trip-dispute-window-hours"
                  placeholder="24"
                  hint="0–720 (blank = server default). The customer can report a partner no-show / trip not done until pickup + this many hours."
                  form={form}
                  error={show('tripDisputeWindowHours')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />

                <h3 className="taxi-policy__group">Operations</h3>
                <PolicyNumberInput
                  field="customerNoShowWaitMinutes"
                  label="Customer no-show wait (minutes)"
                  testId="taxi-no-show-wait-minutes"
                  hint="0–1440. How long the driver waits before a no-show can be declared."
                  form={form}
                  error={show('customerNoShowWaitMinutes')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="customerNoShowMinContactAttempts"
                  label="No-show minimum contact attempts"
                  testId="taxi-no-show-contact-attempts"
                  hint="0–20 calls/messages before no-show."
                  form={form}
                  error={show('customerNoShowMinContactAttempts')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="depositReleaseHoursAfterComplete"
                  label="Settlement window after completion (hours)"
                  testId="taxi-deposit-release-hours"
                  hint="0–720 (0 = immediate). The customer can dispute a completed trip for this long; with no dispute the deposit is returned and the booking fee earned."
                  form={form}
                  error={show('depositReleaseHoursAfterComplete')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="disputeSlaBusinessDays"
                  label="Dispute SLA (business days)"
                  testId="taxi-dispute-sla-days"
                  hint="0–90."
                  form={form}
                  error={show('disputeSlaBusinessDays')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />

                <h3 className="taxi-policy__group">Partner cancellation penalty (bps)</h3>
                <PolicyNumberInput
                  field="penaltyGt24h"
                  label="More than 24 h before pickup"
                  testId="taxi-penalty-gt24h"
                  hint={bpsHint(form.penaltyGt24h, 'of the deposit', '0–10000, or blank')}
                  form={form}
                  error={show('penaltyGt24h')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="penaltyH2to24"
                  label="2–24 h before pickup"
                  testId="taxi-penalty-h2to24"
                  hint={bpsHint(form.penaltyH2to24, 'of the deposit', '0–10000, or blank')}
                  form={form}
                  error={show('penaltyH2to24')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                <PolicyNumberInput
                  field="penaltyLt2hOrNoShow"
                  label="Under 2 h / partner no-show"
                  testId="taxi-penalty-lt2h"
                  hint={bpsHint(form.penaltyLt2hOrNoShow, 'of the deposit', '0–10000, or blank')}
                  form={form}
                  error={show('penaltyLt2hOrNoShow')}
                  showError={showValidation}
                  disabled={disabled}
                  onChange={setField}
                />
                {showValidation && errors.penaltyLadder ? (
                  <p className="taxi-policy__field-error taxi-policy__note" role="alert">
                    {errors.penaltyLadder}
                  </p>
                ) : null}

                <label className="admin-field taxi-policy__notes">
                  Notes (internal)
                  <textarea
                    data-testid="taxi-policy-notes"
                    rows={3}
                    maxLength={2000}
                    value={form.notes}
                    disabled={disabled}
                    onChange={(event) => {
                      setField('notes', event.target.value);
                    }}
                  />
                  {showValidation && errors.notes ? (
                    <span className="taxi-policy__field-error" role="alert">
                      {errors.notes}
                    </span>
                  ) : null}
                </label>

                {saveErrorMessage ? (
                  <p
                    className="taxi-policy__error"
                    role="alert"
                    data-testid="taxi-policy-save-error"
                  >
                    {saveErrorMessage}
                  </p>
                ) : null}
                {publishErrorMessage && !confirmOpen ? (
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
        </div>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Published history</h2>
              <p className="admin-panel__subtitle">Every published version, newest first.</p>
            </div>
          </div>
          {historyErrorMessage ? (
            <AlText tone="muted" role="alert">
              {historyErrorMessage}
            </AlText>
          ) : history.length === 0 ? (
            <p className="taxi-policy__muted" data-testid="taxi-policy-history-empty">
              No published versions yet.
            </p>
          ) : (
            <ul className="admin-history-list" data-testid="taxi-policy-history">
              {history.map((row, index) => (
                <li key={row.id}>
                  <strong>{index === 0 ? 'Live' : 'Superseded'}</strong>
                  <span className="admin-history-list__meta">
                    {typeof row.customerAdvanceBps === 'number'
                      ? `Advance ${bpsToPercent(row.customerAdvanceBps)}`
                      : null}
                    {typeof row.partnerDepositBps === 'number'
                      ? ` · Deposit ${bpsToPercent(row.partnerDepositBps)}`
                      : null}
                    {typeof row.depositReleaseHoursAfterComplete === 'number'
                      ? ` · Release ${String(row.depositReleaseHoursAfterComplete)} h`
                      : null}
                    {row.publishedAt ? ` · ${formatAdminDateTime(row.publishedAt)}` : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <AlModal
          open={confirmOpen}
          onOpenChange={(next) => {
            if (!busy) setConfirmOpen(next);
          }}
          size="md"
          title="Publish Taxi policy?"
          description="Publishing is immutable and takes effect for new bookings immediately. Review what changes."
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={isPublishing}
                onClick={() => {
                  setConfirmOpen(false);
                }}
              >
                Cancel
              </AlButton>
              <AlButton
                data-testid="taxi-policy-publish-confirm"
                loading={isPublishing}
                onClick={() => {
                  void onConfirmPublish();
                }}
              >
                Publish now
              </AlButton>
            </div>
          }
        >
          {diff.length === 0 ? (
            <AlText tone="muted" data-testid="taxi-policy-diff-empty">
              The draft is identical to the live policy. Publishing records a new version with the
              same values.
            </AlText>
          ) : (
            <table className="taxi-policy__diff" data-testid="taxi-policy-diff">
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">Live</th>
                  <th scope="col">After publish</th>
                </tr>
              </thead>
              <tbody>
                {diff.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    <td>{row.before}</td>
                    <td>{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {publishErrorMessage ? (
            <p className="taxi-policy__error" role="alert">
              {publishErrorMessage}
            </p>
          ) : null}
        </AlModal>
      </AlStack>
    </RequirePermission>
  );
}

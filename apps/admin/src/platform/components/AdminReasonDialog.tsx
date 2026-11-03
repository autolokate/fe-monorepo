import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useId, useState, type ReactNode } from 'react';

/** Server bound on every admin audit reason (`reason: string(3..500)`). */
export const ADMIN_REASON_MIN = 3;
export const ADMIN_REASON_MAX = 500;

/**
 * `null` = acceptable to submit. A required reason needs 3..500 chars; an optional one may be blank
 * but, when typed, must still meet the server's minimum (a 1–2 char reason would answer 400).
 */
export function adminReasonError(reason: string, required: boolean): string | null {
  const trimmed = reason.trim();
  if (trimmed.length === 0) return required ? 'A reason is required.' : null;
  if (trimmed.length < ADMIN_REASON_MIN) {
    return `At least ${String(ADMIN_REASON_MIN)} characters.`;
  }
  if (trimmed.length > ADMIN_REASON_MAX) {
    return `At most ${String(ADMIN_REASON_MAX)} characters.`;
  }
  return null;
}

export type AdminReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  /** Required reasons gate the confirm button; optional ones are sent only when typed. */
  required?: boolean;
  destructive?: boolean;
  loading?: boolean;
  /** Server/mutation error to show under the field. */
  error?: string | null;
  /** Called with the trimmed reason, or `undefined` when an optional reason was left blank. */
  onConfirm: (reason: string | undefined) => void;
  /** `data-testid` prefix → `{prefix}-reason`, `{prefix}-confirm`, `{prefix}-cancel`. */
  testIdPrefix: string;
  reasonLabel?: string;
  placeholder?: string;
  /** Extra context above the reason field (what will happen, who is affected). */
  children?: ReactNode;
};

/**
 * Confirm dialog for an audited admin action. The reason is recorded on the audit row server-side;
 * the dialog never closes itself on confirm — the caller closes it on success so errors stay visible.
 */
export function AdminReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  required = true,
  destructive = false,
  loading = false,
  error = null,
  onConfirm,
  testIdPrefix,
  reasonLabel,
  placeholder,
  children,
}: AdminReasonDialogProps) {
  const fieldId = useId();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  const validation = adminReasonError(reason, required);
  const label =
    reasonLabel ??
    (required
      ? 'Reason (recorded in the audit log)'
      : 'Reason (optional, recorded in the audit log)');

  return (
    <AlModal
      open={open}
      onOpenChange={(next) => {
        if (!next && loading) return;
        onOpenChange(next);
      }}
      title={title}
      {...(description ? { description } : {})}
      footer={
        <div className="admin-modal-actions">
          <AlButton
            variant="secondary"
            disabled={loading}
            data-testid={`${testIdPrefix}-cancel`}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
          <AlButton
            variant={destructive ? 'destructive' : 'primary'}
            loading={loading}
            disabled={loading || validation !== null}
            data-testid={`${testIdPrefix}-confirm`}
            onClick={() => {
              if (validation !== null) {
                setTouched(true);
                return;
              }
              const trimmed = reason.trim();
              onConfirm(trimmed.length > 0 ? trimmed : undefined);
            }}
          >
            {confirmLabel}
          </AlButton>
        </div>
      }
    >
      {children}
      <label className="admin-field" htmlFor={fieldId}>
        {label}
        <textarea
          id={fieldId}
          data-testid={`${testIdPrefix}-reason`}
          rows={3}
          maxLength={ADMIN_REASON_MAX}
          value={reason}
          placeholder={placeholder ?? 'What happened and why'}
          aria-invalid={touched && validation !== null ? true : undefined}
          onBlur={() => {
            setTouched(true);
          }}
          onChange={(event) => {
            setReason(event.target.value);
          }}
        />
        <span className="admin-field__hint">
          {touched && validation
            ? validation
            : `${String(reason.trim().length)}/${String(ADMIN_REASON_MAX)}`}
        </span>
      </label>
      {error ? (
        <p className="admin-form-error" role="alert" data-testid={`${testIdPrefix}-error`}>
          {error}
        </p>
      ) : null}
    </AlModal>
  );
}

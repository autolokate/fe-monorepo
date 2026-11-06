import { AlButton, AlErrorState } from '@autolokate/ui';

import type { DqErrorView } from '@/features/drivequant/dq-errors';
import type { DqTone } from '@/features/drivequant/drivequant-model';
import { notifyAdminStepUpRequired } from '@/platform/api/admin-api-client';

import './drivequant.css';

export function DqChip({ label, tone }: { label: string; tone: DqTone }) {
  return <span className={`dq-chip dq-chip--${tone}`}>{label}</span>;
}

/** Error + retry; a 403 step-up adds "Sign in again" (same as the SOS console). */
export function DqErrorBlock({ error, onRetry }: { error: DqErrorView; onRetry: () => void }) {
  return (
    <div className="dq-error" data-testid="dq-error">
      <AlErrorState message={error.message} onRetry={onRetry} />
      {error.stepUp ? (
        <AlButton size="sm" variant="primary" onClick={notifyAdminStepUpRequired}>
          Sign in again
        </AlButton>
      ) : null}
    </div>
  );
}

/** Raw JSON in a collapsed `<details>` — for keys this UI has no layout for. */
export function DqRawBlock({
  title,
  value,
  testId,
}: {
  title: string;
  value: unknown;
  testId?: string;
}) {
  let text: string;
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  return (
    <details className="dq-raw" data-testid={testId}>
      <summary>{title}</summary>
      <pre className="dq-raw__pre">{text}</pre>
    </details>
  );
}

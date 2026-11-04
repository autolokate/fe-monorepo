import type { AdminSosSummary } from '@autolokate/api-client';
import { Phone } from 'lucide-react';

import { sosStateMeta, sosStatusLabel, telHref, whatsAppHref } from '@/features/sos/sos-model';

/** State badge — tone by severity, pulsing dot while the incident is live and critical. */
export function SosStateBadge({
  row,
}: {
  row: Pick<AdminSosSummary, 'state' | 'resolution' | 'urgent'>;
}) {
  const meta = sosStateMeta(row.state);
  return (
    <span
      className={`sos-badge sos-badge--${meta.tone}`}
      title={meta.hint || undefined}
      data-testid="sos-state-badge"
      data-state={row.state}
    >
      <span className="sos-badge__dot" aria-hidden />
      {sosStatusLabel(row)}
    </span>
  );
}

export function SosUrgentFlag() {
  return (
    <span className="sos-urgent" data-testid="sos-urgent">
      Urgent
    </span>
  );
}

export function SosTriggerBadge({ trigger }: { trigger: string }) {
  return (
    <span className={`sos-trigger sos-trigger--${trigger === 'CRASH' ? 'crash' : 'sos'}`}>
      {trigger === 'CRASH' ? 'Crash' : 'SOS'}
    </span>
  );
}

/** Click-to-call link (tel:). Stops row-click propagation so tapping the number never navigates. */
export function SosPhoneLink({
  phone,
  testId,
  className,
}: {
  phone: string | null | undefined;
  testId?: string;
  className?: string;
}) {
  const href = telHref(phone);
  if (!phone) return <span className="admin-muted">No phone</span>;
  if (!href) return <span className="admin-mono">{phone}</span>;
  return (
    <a
      className={['admin-link sos-phone', className].filter(Boolean).join(' ')}
      href={href}
      data-testid={testId}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <Phone size={13} aria-hidden />
      <span className="admin-mono">{phone}</span>
    </a>
  );
}

export function SosWhatsAppLink({ phone }: { phone: string | null | undefined }) {
  const href = whatsAppHref(phone);
  if (!href) return null;
  return (
    <a className="admin-link" href={href} target="_blank" rel="noreferrer noopener">
      WhatsApp
    </a>
  );
}

/** SENT/ANSWERED → ok, FAILED/NO_ANSWER/BUSY → bad, SKIPPED/REQUESTED/RINGING/unknown → pending. */
export function SosDeliveryChip({ label, status }: { label: string; status: string | null }) {
  const value = status ?? 'NONE';
  const tone =
    value === 'SENT' || value === 'ANSWERED' || value === 'DELIVERED'
      ? 'ok'
      : value === 'FAILED' || value === 'NO_ANSWER' || value === 'BUSY'
        ? 'bad'
        : 'pending';
  return (
    <span className={`sos-delivery sos-delivery--${tone}`}>
      {label}: {status ? status.replace(/_/g, ' ').toLowerCase() : 'not sent'}
    </span>
  );
}

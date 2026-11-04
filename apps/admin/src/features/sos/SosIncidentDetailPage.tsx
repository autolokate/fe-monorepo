import type { AdminSosDetail } from '@autolokate/api-client';
import { AlButton, AlErrorState, AlPageHeader, AlStack } from '@autolokate/ui';
import { ArrowLeft, Timer } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { SosActionBar } from '@/features/sos/SosActionBar';
import { SosLocationMap } from '@/features/sos/SosLocationMap';
import { sosErrorView } from '@/features/sos/sos-errors';
import {
  formatSosCountdown,
  formatSosElapsed,
  isSosTerminal,
  sosActivationReason,
  sosCallOutcome,
  sosNextStep,
  sosStateMeta,
  sosTimelineLabel,
  sosTrail,
} from '@/features/sos/sos-model';
import {
  SosDeliveryChip,
  SosPhoneLink,
  SosStateBadge,
  SosTriggerBadge,
  SosUrgentFlag,
  SosWhatsAppLink,
} from '@/features/sos/sos-ui';
import { useNow, useSosIncidentDetail } from '@/hooks/sos/useSosIncidents';
import { notifyAdminStepUpRequired } from '@/platform/api/admin-api-client';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import {
  AdminPanel,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './sos.css';

function NextStepHero({ detail, now }: { detail: AdminSosDetail; now: number }) {
  const meta = sosStateMeta(detail.state);
  const step = sosNextStep(detail);
  const countdown = step?.atMs ? formatSosCountdown(step.atMs, now) : null;
  const reason = sosActivationReason(detail.activationReason);
  return (
    <div className={`sos-hero sos-hero--${meta.tone}`} data-testid="sos-hero">
      <div className="sos-hero__main">
        <div className="sos-hero__badges">
          <SosStateBadge row={detail} />
          <SosTriggerBadge trigger={detail.trigger} />
          {detail.urgent && !isSosTerminal(detail.state) ? <SosUrgentFlag /> : null}
        </div>
        <p className="sos-hero__hint">{meta.hint}</p>
        {reason ? <p className="sos-hero__reason">Activated because: {reason}</p> : null}
        {detail.userResponse ? (
          <p className="sos-hero__reason">
            User answered {detail.userResponse === 'SAFE' ? '“I am safe”' : '“I need help”'}
            {detail.userResponseChannel === 'DTMF' ? ' on the call' : ' in the app'}
          </p>
        ) : null}
      </div>
      <div className="sos-hero__side">
        <span className="sos-hero__elapsed ax-num">{formatSosElapsed(detail.openedAt, now)}</span>
        <span className="sos-hero__elapsed-label">since the alert</span>
        {step ? (
          <span className="sos-hero__countdown" data-testid="sos-countdown">
            <Timer size={14} aria-hidden /> {step.label}{' '}
            <strong className="ax-num">{countdown ?? 'any moment'}</strong>
            {step.estimated ? <span className="admin-muted"> (est.)</span> : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function UserCard({ detail }: { detail: AdminSosDetail }) {
  return (
    <AdminPanel title="User" subtitle="The account that raised the SOS / owns the crashed drive.">
      <div className="sos-user" data-testid="sos-user-card">
        <span className="sos-user__name">{detail.subject.name ?? 'Unnamed user'}</span>
        <SosPhoneLink
          phone={detail.subject.phone}
          testId="sos-user-phone"
          className="sos-user__phone"
        />
        <span className="admin-muted admin-mono" title={detail.subject.accountId}>
          Account {shortAdminId(detail.subject.accountId)}
        </span>
      </div>
      <AdminDetailGrid>
        <AdminDetailField label="Opened" value={formatAdminDateTime(detail.openedAt)} />
        <AdminDetailField label="Source" value={humanizeAdminLabel(detail.incident.source)} />
        <AdminDetailField label="Family rounds" value={String(detail.familyNotifiedRounds)} />
        <AdminDetailField
          label="Ambulance"
          value={
            detail.ambulanceReleasedAt
              ? `Released ${formatAdminDateTime(detail.ambulanceReleasedAt)}`
              : 'Held'
          }
        />
        {detail.incident.resolvedAt ? (
          <AdminDetailField
            label="Closed"
            value={`${formatAdminDateTime(detail.incident.resolvedAt)}${detail.resolution ? ` · ${humanizeAdminLabel(detail.resolution)}` : ''}`}
          />
        ) : null}
        {detail.incident.suspectedFalseAlarm ? (
          <AdminDetailField label="Flag" value="Suspected false alarm" />
        ) : null}
      </AdminDetailGrid>
    </AdminPanel>
  );
}

function CallsPanel({ detail }: { detail: AdminSosDetail }) {
  return (
    <AdminPanel title="Safety calls" subtitle="Autolokate IVR: press 1 if safe, 2 for help.">
      {detail.calls.length === 0 ? (
        <p className="admin-muted">No call placed yet.</p>
      ) : (
        <ol className="sos-list" data-testid="sos-calls">
          {[...detail.calls]
            .sort((a, b) => a.attemptNo - b.attemptNo)
            .map((call) => (
              <li key={call.attemptNo} className="sos-list__item">
                <div className="sos-list__head">
                  <strong>Call {call.attemptNo}</strong>
                  <SosDeliveryChip label="Result" status={call.status} />
                  {call.initiatedByAdminId ? (
                    <span className="sos-chip-muted">by operator</span>
                  ) : null}
                </div>
                <p className="sos-list__body">{sosCallOutcome(call)}</p>
                <p className="admin-muted sos-list__meta">
                  Placed {formatAdminDateTime(call.requestedAt)} · rings until{' '}
                  {formatAdminDateTime(call.ringDeadlineAt)}
                  {call.endedAt ? ` · ended ${formatAdminDateTime(call.endedAt)}` : ''}
                  {typeof call.durationS === 'number'
                    ? ` · ${String(call.durationS)} s`
                    : ''} · {call.provider}
                  {call.failureReason ? ` · ${call.failureReason}` : ''}
                </p>
              </li>
            ))}
        </ol>
      )}
    </AdminPanel>
  );
}

function ContactsPanel({ detail }: { detail: AdminSosDetail }) {
  return (
    <AdminPanel title="Emergency contacts" subtitle="Voice call + WhatsApp per notification round.">
      {detail.contacts.length === 0 ? (
        <p className="admin-muted">No emergency contacts on this account.</p>
      ) : (
        <ul className="sos-list" data-testid="sos-contacts">
          {detail.contacts.map((contact) => {
            const latest = [...contact.notifications].sort((a, b) => b.round - a.round)[0];
            return (
              <li key={contact.contactId} className="sos-list__item">
                <div className="sos-list__head">
                  <strong>{contact.name}</strong>
                  {contact.relation ? (
                    <span className="sos-chip-muted">{humanizeAdminLabel(contact.relation)}</span>
                  ) : null}
                </div>
                <div className="sos-contact__links">
                  <SosPhoneLink phone={contact.phone} />
                  <SosWhatsAppLink phone={contact.phone} />
                </div>
                {latest ? (
                  <div className="sos-contact__status">
                    <span className="admin-muted">Round {latest.round}:</span>
                    <SosDeliveryChip label="Call" status={latest.voiceStatus} />
                    <SosDeliveryChip label="WhatsApp" status={latest.whatsappStatus} />
                    {latest.failureReason ? (
                      <span className="admin-muted">{latest.failureReason}</span>
                    ) : null}
                  </div>
                ) : (
                  <p className="admin-muted sos-list__meta">Not notified yet.</p>
                )}
                {contact.notifications.length > 1 ? (
                  <p className="admin-muted sos-list__meta">
                    {contact.notifications.length} rounds in total
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </AdminPanel>
  );
}

function VehiclesPanel({ detail }: { detail: AdminSosDetail }) {
  return (
    <AdminPanel title="Vehicles">
      {detail.vehicles.length === 0 ? (
        <p className="admin-muted">No vehicle linked.</p>
      ) : (
        <ul className="sos-list" data-testid="sos-vehicles">
          {detail.vehicles.map((vehicle) => (
            <li key={`${vehicle.vehicleId}-${vehicle.role}`} className="sos-list__item">
              <div className="sos-list__head">
                <strong className="admin-mono">{vehicle.plate ?? 'No plate'}</strong>
                <span className="sos-chip-muted">{humanizeAdminLabel(vehicle.role)}</span>
                {vehicle.isIncidentVehicle ? <span className="sos-urgent">This SOS</span> : null}
              </div>
              <p className="sos-list__body">
                {[vehicle.color, vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}

function CrashPanel({ detail }: { detail: AdminSosDetail }) {
  if (detail.crash.length === 0) return null;
  return (
    <AdminPanel title="Crash telemetry" subtitle="DriveQuant crash detection.">
      <ul className="sos-list" data-testid="sos-crash">
        {detail.crash.map((crash) => (
          <li key={crash.crashId} className="sos-list__item">
            <div className="sos-list__head">
              <strong>{humanizeAdminLabel(crash.state)}</strong>
              <span className="sos-chip-muted">{humanizeAdminLabel(crash.outcome)}</span>
            </div>
            <p className="sos-list__body">
              {typeof crash.probability === 'number'
                ? `Crash probability ${String(Math.round(crash.probability <= 1 ? crash.probability * 100 : crash.probability))}%`
                : 'Probability not reported'}
              {crash.crashAt ? ` · ${formatAdminDateTime(crash.crashAt)}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </AdminPanel>
  );
}

function DispatchPanel({ detail }: { detail: AdminSosDetail }) {
  return (
    <AdminPanel title="Ambulance dispatch" subtitle="Medulance → backup → 112 tracker.">
      {detail.dispatchSteps.length === 0 ? (
        <p className="admin-muted">
          {detail.ambulanceReleasedAt
            ? 'Released — waiting for the first dispatch step.'
            : 'Ambulance leg held (not requested).'}
        </p>
      ) : (
        <ol className="sos-list" data-testid="sos-dispatch">
          {detail.dispatchSteps.map((step, index) => (
            <li key={`${step.step}-${step.at}-${String(index)}`} className="sos-list__item">
              <div className="sos-list__head">
                <strong>{humanizeAdminLabel(step.step)}</strong>
                <SosDeliveryChip label="State" status={step.state} />
              </div>
              <p className="admin-muted sos-list__meta">{formatAdminDateTime(step.at)}</p>
            </li>
          ))}
        </ol>
      )}
    </AdminPanel>
  );
}

function TimelinePanel({ detail }: { detail: AdminSosDetail }) {
  const events = useMemo(
    () => [...detail.timeline].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)),
    [detail.timeline],
  );
  return (
    <AdminPanel title="Timeline" subtitle="Newest first. Notes are operator-only.">
      {events.length === 0 ? (
        <p className="admin-muted">No events yet.</p>
      ) : (
        <ol className="sos-timeline" data-testid="sos-timeline">
          {events.map((event, index) => (
            <li
              key={`${event.type}-${event.at}-${String(index)}`}
              className={`sos-timeline__item sos-timeline__item--${event.actor.toLowerCase()}`}
            >
              <span className="sos-timeline__dot" aria-hidden />
              <div>
                <p className="sos-timeline__title">
                  {sosTimelineLabel(event.type)}{' '}
                  <span className="sos-chip-muted">{humanizeAdminLabel(event.actor)}</span>
                </p>
                {event.note ? (
                  <p className="sos-timeline__note" data-testid="sos-timeline-note">
                    {event.note}
                  </p>
                ) : null}
                <p className="admin-muted sos-list__meta">{formatAdminDateTime(event.at)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </AdminPanel>
  );
}

export function SosIncidentDetailPage() {
  const { incidentId = '' } = useParams<{ incidentId: string }>();
  const query = useSosIncidentDetail(incidentId || null);
  const now = useNow();
  const detail = query.data ?? null;
  const errorView = query.isError ? sosErrorView(query.error) : null;
  const trail = useMemo(() => (detail ? sosTrail(detail) : []), [detail]);

  return (
    <RequirePermission permission="sos:view">
      <AlStack gap="md">
        <Link className="admin-link sos-back" to={adminPaths.sosIncidents}>
          <ArrowLeft size={14} aria-hidden /> All emergencies
        </Link>
        <AlPageHeader
          title={detail ? `SOS · ${detail.subject.name ?? 'Unnamed user'}` : 'SOS incident'}
          description={`Incident ${shortAdminId(incidentId)} · live view, refreshes every 5 s while visible. Every view and action is audited.`}
        />
        {!detail && query.isLoading ? <AdminPageLoader label="Loading incident…" /> : null}
        {!detail && errorView ? (
          <div className="sos-stack">
            <AlErrorState
              message={errorView.message}
              onRetry={() => {
                void query.refetch();
              }}
            />
            {errorView.stepUp ? (
              <AlButton variant="primary" onClick={notifyAdminStepUpRequired}>
                Sign in again
              </AlButton>
            ) : null}
          </div>
        ) : null}
        {detail ? (
          <>
            {errorView ? (
              <p className="admin-form-error" role="status" data-testid="sos-detail-stale">
                Live refresh failed: {errorView.message} Showing the last loaded data.
              </p>
            ) : null}
            <NextStepHero detail={detail} now={now} />
            <div className="sos-action-sticky">
              <SosActionBar incident={detail} />
            </div>
            <div className="sos-detail-grid" data-testid="sos-detail">
              <div className="sos-detail-grid__col">
                <UserCard detail={detail} />
                <CallsPanel detail={detail} />
                <ContactsPanel detail={detail} />
                <DispatchPanel detail={detail} />
                <CrashPanel detail={detail} />
              </div>
              <div className="sos-detail-grid__col">
                <AdminPanel
                  title="Live location"
                  subtitle={`${String(detail.locations.length)} live fixes`}
                >
                  <SosLocationMap
                    trail={trail}
                    nowMs={now}
                    fromAlertOnly={detail.locations.length === 0}
                  />
                </AdminPanel>
                <VehiclesPanel detail={detail} />
                <TimelinePanel detail={detail} />
              </div>
            </div>
          </>
        ) : null}
      </AlStack>
    </RequirePermission>
  );
}

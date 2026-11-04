import { ArrowUpRight, Siren } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { countSosIncidents } from '@/features/sos/sos-model';
import { useSosIncidents } from '@/hooks/sos/useSosIncidents';

import './sos.css';

/** Dashboard poll is gentler than the console's (each read is an audited PII access). */
const DASHBOARD_POLL_MS = 30_000;

/** Open SOS / crash emergencies at a glance — links into the live console. */
export function SosDashboardTile() {
  const list = useSosIncidents({ pollMs: DASHBOARD_POLL_MS });
  const counts = useMemo(() => countSosIncidents(list.rows), [list.rows]);
  if (!list.canView || list.notDeployed) return null;
  const tone = counts.urgent > 0 ? 'urgent' : counts.open > 0 ? 'active' : 'calm';
  const pending = list.isLoading;
  const failed = list.isError && !list.data;
  const value = (n: number) => (pending ? '…' : failed ? '—' : String(n));
  return (
    <Link
      to={adminPaths.sosIncidents}
      className={`sos-dash sos-dash--${tone}`}
      data-testid="dashboard-sos-tile"
      aria-label={`SOS console: ${value(counts.open)} open emergencies, ${value(counts.urgent)} urgent`}
    >
      <span className="sos-dash__title">
        <Siren size={18} aria-hidden /> SOS &amp; crash emergencies
        <ArrowUpRight size={15} aria-hidden />
      </span>
      <span className="sos-dash__stats">
        <span className="sos-dash__stat">
          <span className="sos-dash__value ax-num" data-testid="dashboard-sos-open">
            {value(counts.open)}
          </span>
          <span className="sos-dash__label">Open</span>
        </span>
        <span className="sos-dash__stat">
          <span className="sos-dash__value ax-num" data-testid="dashboard-sos-urgent">
            {value(counts.urgent)}
          </span>
          <span className="sos-dash__label">Urgent</span>
        </span>
        <span className="sos-dash__stat">
          <span className="sos-dash__value ax-num">{value(counts.awaitingAdmin)}</span>
          <span className="sos-dash__label">Safe — awaiting you</span>
        </span>
        <span className="sos-dash__stat">
          <span className="sos-dash__value ax-num">{value(counts.calling)}</span>
          <span className="sos-dash__label">Calling user</span>
        </span>
      </span>
    </Link>
  );
}

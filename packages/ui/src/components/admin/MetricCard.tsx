import type { ReactNode } from 'react';

import { AlHeading, AlStack, AlText } from '../primitives/index.js';
import './MetricCard.css';

export type AlMetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { label: string; direction: 'up' | 'down' | 'neutral' };
};

export function AlMetricCard({ label, value, hint, trend }: AlMetricCardProps) {
  return (
    <article className="al-metric-card al-admin-surface">
      <AlStack gap="xs">
        <AlText variant="label" tone="muted">
          {label}
        </AlText>
        <AlHeading variant="h3">{value}</AlHeading>
        {hint ? <AlText variant="caption" tone="muted">{hint}</AlText> : null}
        {trend ? (
          <span className={`al-metric-card__trend al-metric-card__trend--${trend.direction}`}>
            {trend.label}
          </span>
        ) : null}
      </AlStack>
    </article>
  );
}

export type AlStatCardProps = AlMetricCardProps & {
  icon?: ReactNode;
};

export function AlStatCard({ icon, label, value, hint, trend }: AlStatCardProps) {
  return (
    <article className="al-stat-card al-admin-surface">
      {icon ? <div className="al-stat-card__icon" aria-hidden>{icon}</div> : null}
      <AlStack gap="xs" className="al-stat-card__body">
        <AlText variant="label" tone="muted">
          {label}
        </AlText>
        <AlHeading variant="h3">{value}</AlHeading>
        {hint ? <AlText variant="caption" tone="muted">{hint}</AlText> : null}
        {trend ? (
          <span className={`al-metric-card__trend al-metric-card__trend--${trend.direction}`}>
            {trend.label}
          </span>
        ) : null}
      </AlStack>
    </article>
  );
}

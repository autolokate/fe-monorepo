import type { ReactNode } from 'react';
import { AlHeading, AlStack, AlText } from '@autolokate/ui';

import type { CompositionMeta } from '../compositions/metadata';

import '../components/core-showcase.css';

const rhythmScale = [4, 8, 12, 16, 24, 32] as const;

export type CompositionShowcaseProps = {
  meta: CompositionMeta;
  children: ReactNode;
  issues?: string[];
};

export function CompositionShowcase({ meta, children, issues = [] }: CompositionShowcaseProps) {
  const usedPx = new Set(meta.spacingRhythm.map((entry) => entry.px));

  return (
    <AlStack gap="lg" className="ds-core-showcase">
      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h2">{meta.name}</AlHeading>
        <AlText>{meta.description}</AlText>
        <AlStack gap="xs">
          <AlText variant="label">Figma reference</AlText>
          <AlText variant="caption" tone="muted">
            {meta.figmaSection} · node {meta.figmaNode}
          </AlText>
        </AlStack>
        <AlStack gap="xs">
          <AlText variant="label">Components used</AlText>
          <AlText variant="caption">{meta.components.join(' · ')}</AlText>
        </AlStack>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Light theme</AlHeading>
        <div className="ds-core-showcase__frame" data-theme="light">
          {children}
        </div>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Dark theme</AlHeading>
        <div className="ds-core-showcase__frame ds-core-showcase__frame--dark" data-theme="dark">
          {children}
        </div>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Spacing rhythm (4 · 8 · 12 · 16 · 24 · 32)</AlHeading>
        <AlStack gap="sm">
          {rhythmScale.map((px) => (
            <AlStack key={px} direction="row" gap="md" align="center">
              <AlText variant="caption" tone={usedPx.has(px) ? 'default' : 'muted'}>
                {px}px {usedPx.has(px) ? '✓' : '—'}
              </AlText>
              <AlText variant="caption" tone="muted">
                {meta.spacingRhythm
                  .filter((entry) => entry.px === px)
                  .map((entry) => entry.usage)
                  .join('; ') || 'Not used in this composition'}
              </AlText>
            </AlStack>
          ))}
        </AlStack>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Typography hierarchy</AlHeading>
        <ul className="ds-search-results">
          {meta.typography.map((entry) => (
            <li key={entry}>
              <AlText variant="caption">{entry}</AlText>
            </li>
          ))}
        </ul>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Icon alignment</AlHeading>
        <ul className="ds-search-results">
          {meta.iconAlignment.map((entry) => (
            <li key={entry}>
              <AlText variant="caption">{entry}</AlText>
            </li>
          ))}
        </ul>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Touch targets</AlHeading>
        <ul className="ds-search-results">
          {meta.touchTargets.map((entry) => (
            <li key={entry}>
              <AlText variant="caption">{entry}</AlText>
            </li>
          ))}
        </ul>
      </section>

      {issues.length > 0 ? (
        <section className="ds-card ds-card--showcase">
          <AlHeading variant="h3">Composition mismatches</AlHeading>
          <ul className="ds-search-results">
            {issues.map((issue) => (
              <li key={issue}>
                <AlText variant="caption">{issue}</AlText>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AlStack>
  );
}

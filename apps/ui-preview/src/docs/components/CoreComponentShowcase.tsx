import type { ReactNode } from 'react';
import { useState } from 'react';
import { AlButton, AlHeading, AlStack, AlText } from '@autolokate/ui';

import { CopyButton } from './CopyButton';
import { PropsTable } from './PropsTable';
import type { PropRow } from '../types';

import './core-showcase.css';

export type ShowcaseState =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'focus'
  | 'selected'
  | 'active'
  | 'disabled'
  | 'loading'
  | 'success'
  | 'error';

export const showcaseStates: ShowcaseState[] = [
  'default',
  'hover',
  'pressed',
  'focus',
  'selected',
  'active',
  'disabled',
  'loading',
  'success',
  'error',
];

export type CoreComponentShowcaseProps = {
  name: string;
  description: string;
  whenToUse?: string;
  whenNotToUse?: string;
  overview?: ReactNode;
  variants?: ReactNode;
  sizes?: ReactNode;
  renderStatePreview: (state: ShowcaseState) => ReactNode;
  renderLightTheme?: ReactNode;
  renderDarkTheme?: ReactNode;
  responsive?: ReactNode;
  accessibility?: ReactNode;
  usage: ReactNode;
  code: string;
  props: PropRow[];
};

export function CoreComponentShowcase({
  name,
  description,
  whenToUse,
  whenNotToUse,
  overview,
  variants,
  sizes,
  renderStatePreview,
  renderLightTheme,
  renderDarkTheme,
  responsive,
  accessibility,
  usage,
  code,
  props,
}: CoreComponentShowcaseProps) {
  const [activeState, setActiveState] = useState<ShowcaseState>('default');
  const lightPreview = renderLightTheme ?? renderStatePreview('default');
  const darkPreview = renderDarkTheme ?? renderStatePreview('default');

  return (
    <AlStack gap="lg" className="ds-core-showcase">
      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h2">{name}</AlHeading>
        <AlText>{description}</AlText>
        {whenToUse || whenNotToUse ? (
          <div className="ds-meta-grid">
            {whenToUse ? (
              <div>
                <AlText variant="label">When to use</AlText>
                <AlText>{whenToUse}</AlText>
              </div>
            ) : null}
            {whenNotToUse ? (
              <div>
                <AlText variant="label">When NOT to use</AlText>
                <AlText>{whenNotToUse}</AlText>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Overview</AlHeading>
        {overview ?? (
          <AlText tone="muted">Figma-aligned core component from Autolokate Consumer App.</AlText>
        )}
      </section>

      {variants ? (
        <section className="ds-card ds-card--showcase">
          <AlHeading variant="h3">Variants</AlHeading>
          <div className="ds-preview">{variants}</div>
        </section>
      ) : null}

      {sizes ? (
        <section className="ds-card ds-card--showcase">
          <AlHeading variant="h3">Sizes</AlHeading>
          <div className="ds-preview">{sizes}</div>
        </section>
      ) : null}

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">States</AlHeading>
        <AlStack gap="md">
          <div className="preview-row ds-core-showcase__state-row">
            {showcaseStates.map((state) => (
              <AlButton
                key={state}
                size="sm"
                variant={activeState === state ? 'primary' : 'secondary'}
                onClick={() => {
                  setActiveState(state);
                }}
              >
                {state}
              </AlButton>
            ))}
          </div>
          <AlText variant="caption" tone="muted">
            Simulated state: {activeState}
          </AlText>
          <div className="ds-core-showcase__frame" data-showcase-state={activeState}>
            {renderStatePreview(activeState)}
          </div>
        </AlStack>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Light theme</AlHeading>
        <div className="ds-core-showcase__frame" data-theme="light">
          {lightPreview}
        </div>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Dark theme</AlHeading>
        <div className="ds-core-showcase__frame ds-core-showcase__frame--dark" data-theme="dark">
          {darkPreview}
        </div>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Responsive preview</AlHeading>
        <div className="ds-core-showcase__responsive">
          {(
            [
              ['320', '20rem'],
              ['360', '22.5rem'],
              ['375', '23.4375rem'],
              ['390', '24.375rem'],
              ['414', '25.875rem'],
              ['768', '48rem'],
              ['1024', '64rem'],
            ] as const
          ).map(([label, width]) => (
            <div key={label} className="ds-core-showcase__viewport">
              <AlText variant="caption" tone="muted">
                {label}px
              </AlText>
              <div
                className="ds-core-showcase__frame ds-core-showcase__frame--viewport"
                style={{ maxWidth: width }}
              >
                {responsive ?? renderStatePreview('default')}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Accessibility notes</AlHeading>
        {accessibility ?? (
          <AlStack gap="sm">
            <AlText>
              Use native semantics where available. Pair icons with visible labels or{' '}
              <code className="ds-inline-code">aria-label</code> when icon-only.
            </AlText>
            <AlText tone="muted">
              Verify keyboard focus order, 48dp minimum touch targets, and WCAG AA contrast on
              signal variants.
            </AlText>
          </AlStack>
        )}
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Usage example</AlHeading>
        <div className="ds-preview">{usage}</div>
      </section>

      <section className="ds-card ds-card--showcase">
        <div className="ds-inline-between">
          <AlHeading variant="h3">Code example</AlHeading>
          <CopyButton value={code} />
        </div>
        <pre className="ds-code">{code}</pre>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Props table</AlHeading>
        <PropsTable rows={props} />
      </section>
    </AlStack>
  );
}

import { AlHeading, AlStack, AlText } from '@autolokate/ui';

import { compositionMeta } from '../../compositions/metadata';

export function CompositionIndexPage() {
  return (
    <AlStack gap="lg">
      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h2">Figma Composition Validation</AlHeading>
        <AlText>
          Real-world component assemblies from the Autolokate Consumer App design system. Each
          composition is built with <code className="ds-inline-code">@autolokate/ui</code>,{' '}
          <code className="ds-inline-code">@autolokate/icons</code>, and{' '}
          <code className="ds-inline-code">@autolokate/brand</code> only — no custom CSS overrides
          on the composition itself.
        </AlText>
        <AlText tone="muted">
          Validate light and dark theme rendering, spacing rhythm (4/8/12/16/24/32), typography
          hierarchy, icon alignment, and touch targets per composition page.
        </AlText>
      </section>

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Compositions</AlHeading>
        <ul className="ds-search-results">
          {compositionMeta.map((entry) => (
            <li key={entry.id}>
              <AlText>
                <strong>{entry.name}</strong> — {entry.description}
              </AlText>
            </li>
          ))}
        </ul>
      </section>
    </AlStack>
  );
}

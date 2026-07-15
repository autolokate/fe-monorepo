import { AlHeading, AlScreenBg, type AlScreenBgVariant, AlStack, AlText } from '@autolokate/ui';

import './screen-backgrounds.css';

const variants: { id: AlScreenBgVariant; label: string; description: string }[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Neutral canvas — no ambient tint.',
  },
  {
    id: 'protected',
    label: 'Protected',
    description: 'Green ambient tint for secure / protected states.',
  },
  {
    id: 'attention',
    label: 'Attention',
    description: 'Amber ambient tint for caution or pending actions.',
  },
  {
    id: 'emergency',
    label: 'Emergency',
    description: 'Red ambient tint for urgent or SOS contexts.',
  },
];

function VariantPreview({ variant }: { variant: AlScreenBgVariant }) {
  const meta = variants.find((item) => item.id === variant);

  return (
    <AlScreenBg variant={variant} className="ds-screen-bg-preview">
      <AlStack gap="sm" className="ds-screen-bg-preview__inner">
        <AlText variant="label">{meta?.label}</AlText>
        <AlText variant="caption" tone="muted">
          {meta?.description}
        </AlText>
      </AlStack>
    </AlScreenBg>
  );
}

function ThemeSection({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <section className="ds-card ds-card--showcase">
      <AlHeading variant="h3">{theme === 'light' ? 'Light theme' : 'Dark theme'}</AlHeading>
      <div className={`ds-screen-bg-theme ds-screen-bg-theme--${theme}`} data-theme={theme}>
        <div className="ds-screen-bg-grid">
          {variants.map((variant) => (
            <VariantPreview key={`${theme}-${variant.id}`} variant={variant.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScreenBackgroundsPage() {
  return (
    <AlStack gap="lg">
      <section className="ds-card ds-card--showcase">
        <AlText variant="caption" className="ds-eyebrow">
          Foundations · AlScreenBg
        </AlText>
        <AlHeading variant="h2">Screen Backgrounds</AlHeading>
        <AlText>
          Full-screen canvas with optional ambient tint gradients. Uses{' '}
          <code className="ds-inline-code">--al-color-background</code> and{' '}
          <code className="ds-inline-code">--al-gradient-ambient-*</code> tokens — no hardcoded
          colors.
        </AlText>
      </section>

      <ThemeSection theme="light" />
      <ThemeSection theme="dark" />

      <section className="ds-card ds-card--showcase">
        <AlHeading variant="h3">Responsive preview</AlHeading>
        <div className="ds-core-showcase__responsive">
          {(
            [
              ['320', '20rem'],
              ['375', '23.4375rem'],
              ['414', '25.875rem'],
            ] as const
          ).map(([label, width]) => (
            <div key={label} className="ds-core-showcase__viewport">
              <AlText variant="caption" tone="muted">
                {label}px
              </AlText>
              <div
                className="ds-screen-bg-theme ds-screen-bg-theme--light"
                data-theme="light"
                style={{ maxWidth: width }}
              >
                <VariantPreview variant="protected" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AlStack>
  );
}

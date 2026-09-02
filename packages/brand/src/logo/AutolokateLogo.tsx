import { LOGO_ASPECT_RATIO, type BrandLogoProps } from '../types';

const DEFAULT_LABEL = 'Autolokate';

const LOGO_SRC = {
  light: new URL('../assets/al-logo-light.svg', import.meta.url).href,
  dark: new URL('../assets/al-logo-dark.svg', import.meta.url).href,
} as const;

export function AlLogo({
  size = 120,
  className,
  'aria-label': ariaLabel = DEFAULT_LABEL,
  variant = 'light',
}: BrandLogoProps) {
  const height = typeof size === 'number' ? Math.round(size / LOGO_ASPECT_RATIO) : undefined;

  return (
    <img
      src={LOGO_SRC[variant]}
      width={size}
      height={height}
      className={className}
      aria-label={ariaLabel}
      draggable={false}
      style={{
        display: 'block',
        objectFit: 'contain',
      }}
    />
  );
}

import { type BrandLogoProps } from '../types.js';

const DEFAULT_LABEL = 'Autolokate';

const MARK_SRC = {
  light: new URL('../assets/al-mark-light.svg', import.meta.url).href,
  dark: new URL('../assets/al-mark-dark.svg', import.meta.url).href,
} as const;

export function AlBrandMark({
  size = 32,
  className,
  'aria-label': ariaLabel = DEFAULT_LABEL,
  variant = 'light',
}: BrandLogoProps) {
  return (
    <img
      src={MARK_SRC[variant]}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={ariaLabel}
      draggable={false}
      style={{
        display: 'block',
        objectFit: 'contain',
      }}
    />
  );
}
